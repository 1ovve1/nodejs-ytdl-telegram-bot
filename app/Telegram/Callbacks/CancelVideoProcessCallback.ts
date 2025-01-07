import {CallbackHandlerInterface} from "./CallbackHandler";
import {TelegramServiceInterface} from "../../Services/Telegram/TelegramService";
import {TelegramDataRepositoryInterface} from "../../Repositories/TelegramDataRepository";
import {VideoRepository, VideoRepositoryInterface} from "../../Repositories/VideoRepository";
import {VideoQueueService, VideoQueueServiceInterface} from "../../Services/YouTube/VideoQueue/VideoQueueService";

export class CancelVideoProcessCallback implements CallbackHandlerInterface{
    readonly prefix: string = "cancel_video:";

    readonly videoQueueService: VideoQueueServiceInterface = VideoQueueService.make();

    readonly videoRepository: VideoRepositoryInterface = new VideoRepository();

    async handle(telegramService: TelegramServiceInterface, telegramData: TelegramDataRepositoryInterface): Promise<void> {
        const videoId = Number(telegramData.getMessageContent().replace(this.prefix, ""));

        this.videoQueueService.dropByKey(videoId);

        await this.videoRepository.delete(
            await this.videoRepository.findById(videoId)
        );
    }

    match(data: Buffer): boolean {
        return data.toString().startsWith(this.prefix);
    }
}