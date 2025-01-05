import {Api} from "telegram";

export interface TelegramDataRepositoryInterface {
    getSenderId(): number;

    getMessageId(): number;

    getChatId(): number;

    getMessageContent(): string;
}

export class TelegramDataRepository implements TelegramDataRepositoryInterface {
    private message: Api.Message;

    constructor(message: Api.Message) {
        this.message = message;
    }

    getSenderId(): number {
        return Number(this.message.senderId);
    }

    getMessageId(): number {
        return Number(this.message.id);
    }

    getChatId(): number {
        return Number(this.message.chatId);
    }

    getMessageContent(): string {
        return this.message.message ?? ''
    }
}

export class CallbackTelegramDataRepository implements TelegramDataRepositoryInterface {
    private callbackQuery: Api.UpdateBotCallbackQuery;

    constructor(callbackQuery: Api.UpdateBotCallbackQuery) {
        this.callbackQuery = callbackQuery;
    }

    getChatId(): number {
        return Number(this.callbackQuery.chatInstance);
    }

    getMessageContent(): string {
        return Buffer.from(this.callbackQuery.data ?? []).toString();
    }

    getMessageId(): number {
        return this.callbackQuery.msgId;
    }

    getSenderId(): number {
        return Number(this.callbackQuery.userId);
    }


}