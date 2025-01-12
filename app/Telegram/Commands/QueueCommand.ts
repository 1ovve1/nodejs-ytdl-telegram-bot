import {CommandInterface} from "./Command";
import {TelegramServiceInterface} from "../../Services/Telegram/TelegramService";
import {TelegramDataRepositoryInterface} from "../../Repositories/TelegramDataRepository";
import {VideoQueueService, VideoQueueServiceInterface} from "../../Services/YouTube/VideoQueue/VideoQueueService";
import {RefreshQueuePositionsCallbackKeyboard} from "../Callbacks/Keyboards/RefreshQueuePositionsCallbackKeyboard";

export class QueueCommand implements CommandInterface {
    readonly queueService: VideoQueueServiceInterface = VideoQueueService.make();

    async handle(telegramService: TelegramServiceInterface, telegramData: TelegramDataRepositoryInterface): Promise<void> {
        const lastUpdatedTime = new Date();

        const formattedDate = lastUpdatedTime.toISOString().split("T")[0];
        const formattedTime = lastUpdatedTime.toISOString().split("T")[1].split(",")[0];

        const formattedDateTime = `${formattedDate} ${formattedTime}`;

        await telegramService.sendMessage({
            content: `Текущая длина очереди: ${this.queueService.length()}\n\nПоследнее обновление: ${formattedDateTime} UTC`,
            keyboard: new RefreshQueuePositionsCallbackKeyboard()
        });
    }

    name(): string {
        return "queue";
    }
}