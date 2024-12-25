import {CallbackQueryEvent} from "telegram/events/CallbackQuery";
import {Client} from "../Client";
import {Api} from "telegram";
import UpdateBotCallbackQuery = Api.UpdateBotCallbackQuery;

export interface CallbackHandlerInterface {
    match(data: Buffer): boolean;
    handle(event: UpdateBotCallbackQuery, client: Client): Promise<void>;
}