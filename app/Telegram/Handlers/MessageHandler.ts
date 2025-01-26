import {TelegramDataRepositoryInterface} from "../../Repositories/TelegramDataRepository";
import {TelegramServiceInterface} from "../../Services/Telegram/TelegramService";

export interface MessageHandlerInterface {
    match(messageData: string): boolean;
    handle(telegramService: TelegramServiceInterface, telegramData: TelegramDataRepositoryInterface): Promise<void>;
}