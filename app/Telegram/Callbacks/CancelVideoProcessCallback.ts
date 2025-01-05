import {CallbackHandlerInterface} from "./CallbackHandler";
import {TelegramServiceInterface} from "../../Services/Telegram/TelegramService";
import {TelegramDataRepositoryInterface} from "../../Repositories/TelegramDataRepository";
import {VideoRepository, VideoRepositoryInterface} from "../../Repositories/VideoRepository";

export class CancelVideoProcessCallback implements CallbackHandlerInterface{
    readonly prefix: string = "cancel_video:";

    readonly videoRepository: VideoRepositoryInterface = new VideoRepository();

    async handle(telegramService: TelegramServiceInterface, telegramData: TelegramDataRepositoryInterface): Promise<void> {
        const videoId = Number(telegramData.getMessageContent().replace(this.prefix, ""));

        await this.videoRepository.delete(
            await this.videoRepository.findById(videoId)
        );
    }

    match(data: Buffer): boolean {
        return data.toString().startsWith(this.prefix);
    }
}