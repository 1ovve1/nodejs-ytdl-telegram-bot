import {CallbackQueryEvent} from "telegram/events/CallbackQuery";
import {Client} from "../Client";

export interface CallbackHandlerInterface {
    match(data: Buffer): boolean;
    handle(event: CallbackQueryEvent, client: Client): Promise<void>;
}