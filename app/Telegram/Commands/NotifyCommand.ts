import {CommandInterface} from "./Command";
import {TelegramServiceInterface} from "../../Services/Telegram/TelegramService";
import {TelegramDataRepositoryInterface} from "../../Repositories/TelegramDataRepository";
import environment from "../../../environment";
import {UserRepository, UserRepositoryInterface} from "../../Repositories/UserRepository";
import {sleep} from "telegram/Helpers";

export class NotifyCommand implements CommandInterface {
    readonly userRepository: UserRepositoryInterface = new UserRepository();

    async handle(telegramService: TelegramServiceInterface, telegramData: TelegramDataRepositoryInterface): Promise<void> {
        const authorId = telegramData.getSenderId();

        if (environment?.ADMIN_ID == authorId) {
            const data = telegramData.getMessageContent().substring(7, 4096).trim();
            const users = await this.userRepository.all();

            for (let i = 0; i < users.length; i+=30) {
                for (const user of users.slice(i, i + 30)) {
                    if (user.username === environment?.BOT_USERNAME) {
                        continue;
                    }
                    await telegramService.sendMessage({
                        content: data,
                        chatId: user.tg_id,
                    });
                }

                await sleep(1000);
            }
        }

        return Promise.resolve(undefined);
    }

    name(): string {
        return "notify";
    }
}