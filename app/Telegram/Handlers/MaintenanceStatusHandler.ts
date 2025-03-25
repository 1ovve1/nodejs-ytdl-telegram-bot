import {MessageHandlerInterface} from "./MessageHandler";
import {TelegramServiceInterface} from "../../Services/Telegram/TelegramService";
import {TelegramDataRepositoryInterface} from "../../Repositories/TelegramDataRepository";
import Environment from "../../../environment";

export class MaintenanceStatusHandler implements MessageHandlerInterface {
    async handle(telegramService: TelegramServiceInterface, telegramData: TelegramDataRepositoryInterface): Promise<void> {
        await telegramService.replyTo({
            content: Environment?.MAINTENANCE_MESSAGE ?? 'im busy :('
        });
    }

    match(messageData: string): boolean {
        return true;
    }
}