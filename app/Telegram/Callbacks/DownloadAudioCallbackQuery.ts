import {AbstractCallbackHandler, CallbackHandlerInterface} from "./CallbackHandler";
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
import {Api} from "telegram";
import KeyboardButtonCallback = Api.KeyboardButtonCallback;
import {ButtonLike} from "telegram/define";
import {CancelProcessCallbackKeyboard} from "./Keyboards/CancelProcessCallbackKeyboard";

export class DownloadAudioCallbackQuery extends AbstractCallbackHandler {
    readonly prefix: string = "audio_format:";

    readonly youTubeService: YouTubeServiceInterface = new YouTubeService();
    readonly videoQueueService: VideoQueueServiceInterface = VideoQueueService.make();
    readonly ffmpegService: FFmpegServiceInterface = new FFmpegService();
    readonly fileSystemService: FileSystemServiceInterface = new FileSystemService();

    readonly audioFormatRepository: AudioFormatRepositoryInterface = new AudioFormatRepository();
    readonly videoRepository: VideoRepositoryInterface = new VideoRepository();

    async handle(telegramService: TelegramServiceInterface, telegramData: TelegramDataRepositoryInterface): Promise<void> {
        const audioFormatId = Number(this.getDataFromRaw(telegramData.getMessageContent()));

        const audioFormat = await this.audioFormatRepository.findById(audioFormatId);
        const video = await this.audioFormatRepository.video(audioFormat);

        await this.videoQueueService.pushAndRun(video, async () => {
            try {
                await telegramService.editMessage({ content: "Загружаю метаданные..." });

                const youTubeAudioMetaData: YouTubeAudioMetaDataInterface = await this.youTubeService.getMetaDataFromAudioFormat(video, audioFormat);

                await telegramService.editMessage({ content: "Начинаю загрузку..." });

                const audioFileStream = await this.ffmpegService.downloadFromAudioFormat(
                    youTubeAudioMetaData,
                    async (progress, command) => {
                        try {
                            await this.videoRepository.isExists(video)

                            await telegramService.editMessage({ content: `${Math.round(progress.percent ?? 0)}%...`, keyboard: new CancelProcessCallbackKeyboard(audioFormat) });
                        } catch (_) {
                            command.kill("SIGTERM");

                            throw new Error('SIGTERM');
                        }
                    }
                )

                youTubeAudioMetaData.audioFormat

                await telegramService.editMessage({ content: `Выгрузка в телеграмм...` });

                const file = await telegramService.uploadFile(youTubeAudioMetaData.videoInfo.getTitle(), audioFileStream);

                await telegramService.sendMessage({content: youTubeAudioMetaData.videoInfo.getTitle(), file})

                this.fileSystemService.delete(audioFileStream);

                await telegramService.deleteMessage({});
            } catch (err) {
                console.log(err);

                if (err instanceof Error && err.message === "SIGTERM") {
                    await telegramService.editMessage({ content: "Загрузка аудио остановленна" });
                } else {
                    await telegramService.editMessage({ content: "Произошла ошибка :(" });
                }
            } finally {
                await this.videoRepository.delete(video)
            }
        }, async (queueNumber: number) => {
            await telegramService.editMessage({ content: `Ваша позиция в очереди: ${queueNumber}`, keyboard: new CancelProcessCallbackKeyboard(audioFormat) });
        }, async (error: any): Promise<void> => {
            await telegramService.editMessage({ content: "Загрузка аудио остановленна" });
        });

    }
}