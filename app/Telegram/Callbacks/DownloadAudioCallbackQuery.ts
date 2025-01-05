import {CallbackHandlerInterface} from "./CallbackHandler";
import {
    YouTubeService,
    YouTubeServiceInterface,
    YouTubeAudioMetaDataInterface
} from "../../Services/YouTube/YouTubeService";
import {FFmpegService, FFmpegServiceInterface} from "../../Services/FFmpeg/FFmpegService";
import {VideoQueueService, VideoQueueServiceInterface} from "../../Services/YouTube/VideoQueue/VideoQueueService";
import {AudioFormatRepository, AudioFormatRepositoryInterface} from "../../Repositories/AudioFormatRepository";
import {FileSystemService, FileSystemServiceInterface} from "../../Services/FileSystem/FileSystemService";
import {TelegramServiceInterface} from "../../Services/Telegram/TelegramService";
import {TelegramDataRepositoryInterface} from "../../Repositories/TelegramDataRepository";
import {VideoRepository, VideoRepositoryInterface} from "../../Repositories/VideoRepository";

export class DownloadAudioCallbackQuery implements CallbackHandlerInterface {
    readonly youTubeService: YouTubeServiceInterface = new YouTubeService();
    readonly videoQueueService: VideoQueueServiceInterface = VideoQueueService.make();
    readonly ffmpegService: FFmpegServiceInterface = new FFmpegService();
    readonly fileSystemService: FileSystemServiceInterface = new FileSystemService();

    readonly audioFormatRepository: AudioFormatRepositoryInterface = new AudioFormatRepository();
    readonly videoRepository: VideoRepositoryInterface = new VideoRepository();

    async handle(telegramService: TelegramServiceInterface, telegramData: TelegramDataRepositoryInterface): Promise<void> {
        const audioFormatId = Number(telegramData.getMessageContent().replace("audio_format:", ""));

        const audioFormat = await this.audioFormatRepository.findById(audioFormatId);
        const video = await this.audioFormatRepository.video(audioFormat);

        this.videoQueueService.push(video);

        await this.videoQueueService.wait(video, async () => {
                try {
                    await telegramService.editMessage({ content: "Загружаю метаданные..." });

                    const youTubeAudioMetaData: YouTubeAudioMetaDataInterface = await this.youTubeService.getMetaDataFromAudioFormat(video, audioFormat);

                    await telegramService.editMessage({ content: "Начинаю загрузку..." });

                    let progressValueCache: number = 0;
                    const audioFileStream = await this.ffmpegService.downloadFromAudioFormat(
                        youTubeAudioMetaData,
                        (progress) => {
                            const newPercentageValue = Math.round(progress.percent ?? 0);

                            if (progressValueCache !== newPercentageValue) {
                                telegramService.editMessage({ content: `${newPercentageValue}%...` });

                                progressValueCache = newPercentageValue;
                            }
                        }
                    )

                    await telegramService.editMessage({ content: `Выгрузка в телеграмм...` });

                    const file = await telegramService.uploadFile(youTubeAudioMetaData.videoInfo.getTitle(), audioFileStream);

                    await telegramService.sendMessage({content: youTubeAudioMetaData.videoInfo.getTitle(), file})

                    this.fileSystemService.delete(audioFileStream);

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
        return data.toString().includes("audio_format:");
    }
}