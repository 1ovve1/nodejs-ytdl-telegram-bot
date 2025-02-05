import * as fs from "node:fs";
import {ReadStream} from "node:fs";
import {Api, client} from "telegram";
import {Client} from "../../Telegram/Client";
import {CustomFile} from "telegram/client/uploads";
import {TelegramDataRepository, TelegramDataRepositoryInterface} from "../../Repositories/TelegramDataRepository";
import {FileLike, MarkupLike} from "telegram/define";
import DocumentAttributeVideo = Api.DocumentAttributeVideo;
import {videoFormat} from "@distube/ytdl-core";
import {CallbackKeyboardInterface} from "../../Telegram/Callbacks/Keyboards/CallbackKeyboard";


export interface TelegramServiceInterface {
    uploadFile(fileName: string, fileStream: ReadStream, onProgress?: (progress: number) => void): Promise<Api.InputFile | Api.InputFileBig>;

    getUser(senderId?: number): Promise<Api.TypeUser>;

    replyTo(params: ReplyToParams): Promise<Api.Message>;

    sendMessage(params: SendMessageParams): Promise<Api.Message>;

    editMessage(params: EditMessageParams): Promise<Api.Message>;

    deleteMessage(params: DeleteMessageParams): Promise<void>;

    sendVideo(params: VideoMessageParams): Promise<Api.Message>;
}

export class TelegramService implements TelegramServiceInterface {
    private client: Client;
    private telegramData: TelegramDataRepositoryInterface;

    constructor(client: Client, telegramData: TelegramDataRepositoryInterface) {
        this.client = client;
        this.telegramData = telegramData;
    }

    async uploadFile(fileName: string, fileStream: ReadStream, onProgress?: (progress: number) => void): Promise<Api.InputFile | Api.InputFileBig> {
        return await this.client.uploadFile({
            workers: 1,
            file: new CustomFile(
                `${fileName}.${String(fileStream.path).split('.').pop()}`,
                fs.statSync(fileStream.path).size,
                String(fileStream.path),
            ),
            onProgress
        });
    }

    async getUser(senderId?: number): Promise<Api.TypeUser> {
        senderId ??= this.telegramData.getSenderId();

        const user = (await this.client.invoke(new Api.users.GetUsers({id: [senderId]}))).pop();

        if (user === undefined) {
            throw new Error("User not founded");
        }

        return user;
    }

    async replyTo(params: ReplyToParams): Promise<Api.Message> {
        params.chatId ??= await this.client.getInputEntity(this.telegramData.getSenderId());
        params.messageId ??= this.telegramData.getMessageId();

        return await this.client.sendMessage(params.chatId, {
            ...params,
            replyTo: params.messageId,
            message: params.content,
            buttons: params.keyboard?.make()
        });
    }

    async sendMessage(params: SendMessageParams): Promise<Api.Message> {
        params.chatId ??= await this.client.getInputEntity(this.telegramData.getSenderId());

        return await this.client.sendMessage(params.chatId, {
            ...params,
            message: params.content,
            buttons: params.keyboard?.make(),
        });
    }

    async editMessage(params: EditMessageParams): Promise<Api.Message> {
        params.chatId ??= await this.client.getInputEntity(this.telegramData.getSenderId());
        params.messageId ??= this.telegramData.getMessageId();

        return await this.client.editMessage(
            params.chatId,
            {
                ...params,
                text: params.content,
                message: params.messageId,
                buttons: params.keyboard?.make(),
            }
        );
    }

    async deleteMessage(params: DeleteMessageParams): Promise<void> {
        params.chatId ??= await this.client.getInputEntity(this.telegramData.getSenderId());
        params.messageId ??= this.telegramData.getMessageId();

        await this.client.deleteMessages(
            params.chatId, [params.messageId], { revoke: true }
        );
    }

    async sendVideo(params: VideoMessageParams): Promise<Api.Message> {
        params.chatId ??= await this.client.getInputEntity(this.telegramData.getSenderId());

        return this.client.sendFile(params.chatId, {
            caption: params.content,
            file: params.file,
            attributes: [
                new DocumentAttributeVideo({
                    duration: Number(params.videoFormat.approxDurationMs) / 1000,
                    w: Number(params.videoFormat.width),
                    h: Number(params.videoFormat.height),
                    supportsStreaming: true,
                })
            ]
        });
    }
}


interface ReplyToParams extends SendMessageParams {
    messageId?: number,
}

interface SendMessageParams {
    content: string,
    chatId?: Api.TypeEntityLike,
    keyboard?: CallbackKeyboardInterface,
    file?: FileLike | FileLike[],
}

interface EditMessageParams {
    content: string,
    chatId?: Api.TypeEntityLike,
    messageId?: number,
    keyboard?: CallbackKeyboardInterface,
}

interface DeleteMessageParams {
    chatId?: Api.TypeEntityLike,
    messageId?: number,
}

interface VideoMessageParams {
    videoFormat: videoFormat,
    content?: string,
    chatId?: Api.TypeEntityLike,
    file: FileLike | FileLike[],
}