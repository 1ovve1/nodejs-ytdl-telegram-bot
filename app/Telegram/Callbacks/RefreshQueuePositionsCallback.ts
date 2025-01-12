import {AbstractCallbackHandler} from "./CallbackHandler";
import {TelegramServiceInterface} from "../../Services/Telegram/TelegramService";
import {TelegramDataRepositoryInterface} from "../../Repositories/TelegramDataRepository";
import {VideoQueueService, VideoQueueServiceInterface} from "../../Services/YouTube/VideoQueue/VideoQueueService";
import {RefreshQueuePositionsCallbackKeyboard} from "./Keyboards/RefreshQueuePositionsCallbackKeyboard";

export class RefreshQueuePositionsCallback extends AbstractCallbackHandler {
    readonly prefix: string = "refresh_queue";

    readonly queueService: VideoQueueServiceInterface = VideoQueueService.make();

    async handle(telegramService: TelegramServiceInterface, telegramData: TelegramDataRepositoryInterface): Promise<void> {
        await telegramService.editMessage({
            content: `Текущая длина очереди: ${this.queueService.length()}`,
            keyboard: new RefreshQueuePositionsCallbackKeyboard()
        });
    }
}