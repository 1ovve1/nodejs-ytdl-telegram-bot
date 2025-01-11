import {TelegramServiceInterface} from "../../Services/Telegram/TelegramService";
import {TelegramDataRepositoryInterface} from "../../Repositories/TelegramDataRepository";
import {ButtonLike} from "telegram/define";
import {Api} from "telegram";
import KeyboardButtonCallback = Api.KeyboardButtonCallback;

export interface CallbackHandlerInterface {
    match(data: Buffer): boolean;
    handle(telegramService: TelegramServiceInterface, telegramData: TelegramDataRepositoryInterface): Promise<void>;
    make(caption: string, data: string|number): ButtonLike;
}

export abstract class AbstractCallbackHandler implements CallbackHandlerInterface {
    declare readonly prefix: string;

    protected getDataFromRaw(rawData: string): string {
        console.log(rawData);
        return rawData.replace(this.prefix, "");
    }

    abstract handle(telegramService: TelegramServiceInterface, telegramData: TelegramDataRepositoryInterface): Promise<void>;

    match(data: Buffer): boolean {
        return data.toString().includes(this.prefix);
    }

    make(caption: string, data: string|number): ButtonLike {
        return new KeyboardButtonCallback({
            text: caption,
            data: Buffer.from(`${this.prefix}${data}`)
        });
    }
}