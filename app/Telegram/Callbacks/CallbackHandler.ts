import {TelegramServiceInterface} from "../../Services/Telegram/TelegramService";
import {TelegramDataRepositoryInterface} from "../../Repositories/TelegramDataRepository";

export interface CallbackHandlerInterface {
    match(data: Buffer): boolean;
    handle(telegramService: TelegramServiceInterface, telegramData: TelegramDataRepositoryInterface): Promise<void>;
}