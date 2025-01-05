import {Api} from "telegram";
import {MessageButton} from "telegram/tl/custom/messageButton";
import {message} from "telegram/client";

export interface TelegramDataRepositoryInterface {
    getSenderId(): number;

    getMessageId(): number;

    getChatId(): number;

    getMessageContent(): string;

    getKeyboard(): Api.TypeReplyMarkup | undefined;

    getReplyToMessageId(): number | undefined;
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

    getKeyboard(): Api.TypeReplyMarkup | undefined {
        return this.message.replyMarkup;
    }

    getReplyToMessageId(): number | undefined {
        return this.message.replyToMsgId;
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

    getKeyboard(): Api.TypeReplyMarkup | undefined {
        return undefined;
    }

    getReplyToMessageId(): number | undefined {
        return undefined;
    }
}