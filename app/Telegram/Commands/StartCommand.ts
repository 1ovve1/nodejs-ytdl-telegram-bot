import {CommandInterface} from "./Command";
import {NewMessageEvent} from "telegram/events";
import {Client} from "../Client";

export class StartCommand implements CommandInterface {
    async handle(event: NewMessageEvent, client: Client): Promise<void> {
        await client.sendMessage(Number(event.message.chatId), {message: "Welcome!"})
    }

    name(): string {
        return "start";
    }
}