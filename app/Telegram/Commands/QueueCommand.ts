import {CommandInterface} from "./Command";
import {TelegramServiceInterface} from "../../Services/Telegram/TelegramService";
import {TelegramDataRepositoryInterface} from "../../Repositories/TelegramDataRepository";
import {VideoQueueService, VideoQueueServiceInterface} from "../../Services/YouTube/VideoQueue/VideoQueueService";
import {RefreshQueuePositionsCallbackKeyboard} from "../Callbacks/Keyboards/RefreshQueuePositionsCallbackKeyboard";

export class QueueCommand implements CommandInterface {
    readonly queueService: VideoQueueServiceInterface = VideoQueueService.make();

    async handle(telegramService: TelegramServiceInterface, telegramData: TelegramDataRepositoryInterface): Promise<void> {
        await telegramService.sendMessage({
            content: `Текущая длина очереди: ${this.queueService.length()}`,
            keyboard: new RefreshQueuePositionsCallbackKeyboard()
        });
    }

    name(): string {
        return "queue";
    }
}