import {CallbackHandlerInterface} from "./CallbackHandler";
import {VideoFormatRepository, VideoFormatRepositoryInterface} from "../../Repositories/VideoFormatRepository";
import {YouTubeVideoMetaDataInterface, YouTubeService, YouTubeServiceInterface } from "../../Services/YouTube/YouTubeService";
import {FFmpegService, FFmpegServiceInterface} from "../../Services/FFmpeg/FFmpegService";
import {VideoQueueService, VideoQueueServiceInterface} from "../../Services/YouTube/VideoQueue/VideoQueueService";
import {FileSystemService, FileSystemServiceInterface} from "../../Services/FileSystem/FileSystemService";
import {VideoRepository, VideoRepositoryInterface} from "../../Repositories/VideoRepository";
import {TelegramServiceInterface} from "../../Services/Telegram/TelegramService";
import {TelegramDataRepositoryInterface} from "../../Repositories/TelegramDataRepository";
import {FfmpegCommand} from "fluent-ffmpeg";
import {Api} from "telegram";
import KeyboardButtonCallback = Api.KeyboardButtonCallback;
import ytdl from "@distube/ytdl-core";

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
        const videoFormatInstance: ytdl.videoFormat = JSON.parse(videoFormat.format);
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
                    async (progress, command: FfmpegCommand) => {
                        const newPercentageValue = Math.round(progress.percent ?? 0);

                        if (progressValueCache !== newPercentageValue) {
                            try {
                                await this.videoRepository.isExists(video)

                                await telegramService.editMessage({ content: `${newPercentageValue}%...`, keyboard: [new KeyboardButtonCallback({text: "Отмена", data: Buffer.from(`cancel_video:${video.id}`)})] });
                                progressValueCache = newPercentageValue;
                            } catch (_) {
                                command.kill("SIGTERM");

                                throw new Error('SIGTERM');
                            }
                        }
                    }
                )

                await telegramService.editMessage({ content: `Выгрузка в телеграмм...` });

                const file = await telegramService.uploadFile(youTubeMetaData.videoInfo.getTitle(), videoFileStream);

                await telegramService.sendVideo({content: youTubeMetaData.videoInfo.getTitle(), file, videoFormat: videoFormatInstance})

                this.fileSystemService.delete(videoFileStream);

                await telegramService.deleteMessage({});


            } catch (err) {
                console.log(err);

                if (err instanceof Error && err.message === "SIGTERM") {
                    await telegramService.editMessage({ content: "Загрузка видео остановленна" });
                } else {
                    await telegramService.editMessage({ content: "Произошла ошибка :(" });
                }
            } finally {
                await this.videoRepository.delete(video)
            }
        }, async (queueNumber: number) => {
            await telegramService.editMessage({ content: `Ваша позиция в очереди: ${queueNumber}`, keyboard: [new KeyboardButtonCallback({text: "Отмена", data: Buffer.from(`cancel_video:${video.id}`)})] });
        }, async (error: any): Promise<void> => {
            await telegramService.editMessage({ content: "Загрузка видео остановленна" });
        });
    }

    match(data: Buffer): boolean {
        return data.toString().includes("video_format:");
    }
}