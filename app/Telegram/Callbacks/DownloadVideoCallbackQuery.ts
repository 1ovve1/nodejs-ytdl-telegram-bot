import {CallbackHandlerInterface} from "./CallbackHandler";
import {VideoFormatRepository, VideoFormatRepositoryInterface} from "../../Repositories/VideoFormatRepository";
import {YouTubeVideoMetaDataInterface, YouTubeService, YouTubeServiceInterface } from "../../Services/YouTube/YouTubeService";
import {FFmpegService, FFmpegServiceInterface} from "../../Services/FFmpeg/FFmpegService";
import {VideoQueueService, VideoQueueServiceInterface} from "../../Services/YouTube/VideoQueue/VideoQueueService";
import {FileSystemService, FileSystemServiceInterface} from "../../Services/FileSystem/FileSystemService";
import {VideoRepository, VideoRepositoryInterface} from "../../Repositories/VideoRepository";
import {TelegramServiceInterface} from "../../Services/Telegram/TelegramService";
import {TelegramDataRepositoryInterface} from "../../Repositories/TelegramDataRepository";

export class DownloadVideoCallbackQuery implements CallbackHandlerInterface {
    readonly youTubeService: YouTubeServiceInterface = new YouTubeService();
    readonly videoQueueService: VideoQueueServiceInterface = VideoQueueService.make();
    readonly ffmpegService: FFmpegServiceInterface = new FFmpegService();
    readonly fileSystemService: FileSystemServiceInterface = new FileSystemService();

    readonly videoFormatRepository: VideoFormatRepositoryInterface = new VideoFormatRepository();
    readonly videoRepository: VideoRepositoryInterface = new VideoRepository();

    async handle(telegramService: TelegramServiceInterface, telegramData: TelegramDataRepositoryInterface): Promise<void> {
        const videoFormatId = Number(telegramData.getMessageContent().replace("video_format:", ""));

        const videoFormat = await this.videoFormatRepository.findById(videoFormatId);
        const video = await this.videoFormatRepository.video(videoFormat);

        this.videoQueueService.push(video);

        await this.videoQueueService.wait(video, async () => {
            try {
                await telegramService.editMessage({ content: "Загружаю метаданные..." });

                const youTubeMetaData: YouTubeVideoMetaDataInterface = await this.youTubeService.getMetaDataFromVideoFormat(video, videoFormat);

                await telegramService.editMessage({ content: "Начинаю загрузку..." });

                let progressValueCache: number = 0;
                const videoFileStream = await this.ffmpegService.combineAudioAndVideoFromYouTubeStream(
                    youTubeMetaData,
                    (progress) => {
                        const newPercentageValue = Math.round(progress.percent ?? 0);

                        if (progressValueCache !== newPercentageValue) {
                            telegramService.editMessage({ content: `${newPercentageValue}%...` });

                            progressValueCache = newPercentageValue;
                        }
                    }
                )

                await telegramService.editMessage({ content: `Выгрузка в телеграмм...` });

                const file = await telegramService.uploadFile(youTubeMetaData.videoInfo.getTitle(), videoFileStream);

                await telegramService.sendMessage({content: youTubeMetaData.videoInfo.getTitle(), file})

                this.fileSystemService.delete(videoFileStream);

                await telegramService.deleteMessage({});
            } catch (err) {
                console.log(err);

                await telegramService.editMessage({ content: "Произошла ошибка :(" });
            } finally {
                await this.videoRepository.delete(video)
            }
        }, async (queueNumber: number) => {
            await telegramService.editMessage({ content: `Ваша позиция в очереди: ${queueNumber}` });
        });
    }

    match(data: Buffer): boolean {
        return data.toString().includes("video_format:");
    }
}