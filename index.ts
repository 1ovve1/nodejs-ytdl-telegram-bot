import * as dotenv from "dotenv";
import {Api, TelegramClient} from "telegram";
import {StringSession} from "telegram/sessions";
import * as fs from "node:fs";
import ytdl from "@distube/ytdl-core";
import {NewMessageEvent} from "telegram/events";
import Message = Api.Message;

dotenv.config();

const BOT_TOKEN: string = process.env.BOT_TOKEN ?? '';
const BOT_API_ID: number = parseInt(process.env.BOT_API_ID ?? '');
const BOT_API_HASH: string = process.env.BOT_API_HASH ?? ''

const stringSessions: string = '';

(async () => {
    const client = new TelegramClient(
        new StringSession(stringSessions),
        BOT_API_ID,
        BOT_API_HASH,
        { connectionRetries: 5 }
    );

    await client.start({
        botAuthToken: BOT_TOKEN,
    });

    console.log(client.session.save());

    client.addEventHandler(async (update: NewMessageEvent) => {
        const requestChatId = update.message?.chatId;

        if (requestChatId === undefined) {
            return;
        }

        const requestMessageId = update.message.id;
        const requestMessageContent: string = update.message.message;

        if (requestMessageContent.match(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(?:-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?$/g)) {
            const outputFilePath = `build/storage/video_${requestMessageId}.mp4`;

            const progressMessage: Message = await client.sendMessage(requestChatId, { message: "download..." })

            await downloadVideo(requestMessageContent, outputFilePath);

            try {
                // await progressMessage.edit({text: "sending video..."})

                await client.sendMessage(requestChatId, { replyTo: requestMessageId, file: fs.createReadStream(outputFilePath).path, message: "done!" })

                await progressMessage.delete();
            } catch(err: any) {
                console.error(err);
            } finally {
                fs.unlink(outputFilePath, (err) => console.log(err));
            }
        }
    })
})();

async function downloadVideo(url: string, outputFilePath: string): Promise<void>
{
    return new Promise(((resolve: () => void, reject: (err: Error) => void) => {
        // Get the video and audio streams
        ytdl(url, { filter: 'videoandaudio', quality: "highest", })
            .pipe(fs.createWriteStream(outputFilePath))
            .on('finish', () => {
                resolve()
            })
            .on('error', (err: Error) => {
                reject(err);
            });
    }));
}

