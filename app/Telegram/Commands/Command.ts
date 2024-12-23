import {NewMessageEvent} from "telegram/events";
import {Client} from "../Client";

export interface CommandInterface {
    name(): string;
    handle(event: NewMessageEvent, client: Client): Promise<void>;
}