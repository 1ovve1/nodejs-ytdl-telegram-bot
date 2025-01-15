import {AbstractCallbackHandler, CallbackHandlerInterface} from "./CallbackHandler";
import {TelegramServiceInterface} from "../../Services/Telegram/TelegramService";
import {TelegramDataRepositoryInterface} from "../../Repositories/TelegramDataRepository";
import {VideoRepository, VideoRepositoryInterface} from "../../Repositories/VideoRepository";
import {VideoQueueService, VideoQueueServiceInterface} from "../../Services/YouTube/VideoQueue/VideoQueueService";
import {VideoFormatRepository, VideoFormatRepositoryInterface} from "../../Repositories/VideoFormatRepository";
import {AudioFormatRepository, AudioFormatRepositoryInterface} from "../../Repositories/AudioFormatRepository";

export class CancelDownloadProcessCallback extends AbstractCallbackHandler{
    readonly prefix: string = "cancel_process:";

    readonly videoQueueService: VideoQueueServiceInterface = VideoQueueService.make();

    async handle(telegramService: TelegramServiceInterface, telegramData: TelegramDataRepositoryInterface): Promise<void> {
        const videoId = Number(this.getDataFromRaw(telegramData.getMessageContent()));

        this.videoQueueService.dropByKey(videoId);
    }
}