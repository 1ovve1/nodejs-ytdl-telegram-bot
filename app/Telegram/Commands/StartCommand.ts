import {CommandInterface} from "./Command";
import {TelegramServiceInterface} from "../../Services/Telegram/TelegramService";
import {TelegramDataRepositoryInterface} from "../../Repositories/TelegramDataRepository";

export class StartCommand implements CommandInterface {
    async handle(telegramService: TelegramServiceInterface, telegramData: TelegramDataRepositoryInterface): Promise<void> {
        await telegramService.sendMessage({ content: "Проект Разгром.\n\nДанный бот Загружает видео из YouTube в телеграм: просто отправьте ссылку и выбирете качество.\n\n/queue - узнать текущее состояние очереди." });
    }

    name(): string {
        return "start";
    }
}