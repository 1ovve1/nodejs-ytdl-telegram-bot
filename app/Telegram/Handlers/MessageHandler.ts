import {NewMessageEvent} from "telegram/events";
import {Client} from "../Client";

export interface MessageHandlerInterface {
    match(messageData: string): boolean;
    handle(event: NewMessageEvent, client: Client): Promise<void>;
}