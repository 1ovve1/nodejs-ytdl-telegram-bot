import {MessageHandlerInterface} from "./MessageHandler";
import {NewMessageEvent} from "telegram/events";
import {Api} from "telegram";
import Client = Api.Client;
import db from "../../../models";
import TypeUser = Api.TypeUser;
import User = Api.User;
import TypeChat = Api.TypeChat;

export class DatabaseHandler implements MessageHandlerInterface {
    async handle(event: NewMessageEvent, client: Client): Promise<void> {
        const senderId = Number(event.message.senderId);

        if (senderId) {
            const isUserExistsInDb = await db.User.findOne({ where: { tg_id: senderId } });

            if (!isUserExistsInDb) {
                const users: TypeUser[] = await client.invoke(new Api.users.GetUsers({id: [senderId]}))

                users.map(async (user: TypeUser) => {
                    if (user instanceof User) {
                        console.log('store user...')

                        await db.User.create({
                            tg_id: Number(user.id),
                            first_name: user.firstName ?? '',
                            last_name: user.lastName ?? '',
                            username: user.username ?? '',
                        });
                    }
                })
            }
        }
    }

    match(messageData: string): boolean {
        return true;
    }
}