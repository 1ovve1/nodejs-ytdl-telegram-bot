import {TelegramServiceInterface} from "../../Services/Telegram/TelegramService";
import {TelegramDataRepositoryInterface} from "../../Repositories/TelegramDataRepository";

export interface CommandInterface {
    name(): string;
    handle(telegramService: TelegramServiceInterface, telegramData: TelegramDataRepositoryInterface): Promise<void>;
}