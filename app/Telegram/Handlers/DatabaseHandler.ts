import {MessageHandlerInterface} from "./MessageHandler";
import {Api} from "telegram";
import TypeUser = Api.TypeUser;
import {TelegramServiceInterface} from "../../Services/Telegram/TelegramService";
import {TelegramDataRepositoryInterface} from "../../Repositories/TelegramDataRepository";
import {UserRepository, UserRepositoryInterface} from "../../Repositories/UserRepository";

export class DatabaseHandler implements MessageHandlerInterface {
    readonly userRepository: UserRepositoryInterface = new UserRepository();

    async handle(telegramService: TelegramServiceInterface, telegramData: TelegramDataRepositoryInterface): Promise<void> {
        const senderId = telegramData.getSenderId();

        if (senderId && !(await this.userRepository.isExistsById(senderId))) {
            const user: TypeUser = await telegramService.getUser(senderId);

            console.log('store user...')

            await this.userRepository.create(user);
        }
    }

    match(messageData: string): boolean {
        return true;
    }
}