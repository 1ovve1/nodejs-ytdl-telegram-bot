import {CommandInterface} from "./Command";
import {TelegramServiceInterface} from "../../Services/Telegram/TelegramService";
import {TelegramDataRepositoryInterface} from "../../Repositories/TelegramDataRepository";

export class StartCommand implements CommandInterface {
    async handle(telegramService: TelegramServiceInterface, telegramData: TelegramDataRepositoryInterface): Promise<void> {
        await telegramService.sendMessage({ content: "Welcome!" });
    }

    name(): string {
        return "start";
    }
}