import * as dotenv from "dotenv";
import {TelegramClient} from "telegram";
import {StringSession} from "telegram/sessions";
import * as fs from "node:fs";
import ytdl from "@distube/ytdl-core";
import ffmpeg from 'fluent-ffmpeg';
import {switchToChat} from "telegraf/typings/button";
import {NewMessageEvent} from "telegram/events";

dotenv.config();

const BOT_TOKEN: string = process.env.BOT_TOKEN ?? '';
const BOT_API_ID: number = parseInt(process.env.BOT_API_ID ?? '');
const BOT_API_HASH: string = process.env.BOT_API_HASH ?? ''

const stringSessions: string = '';

// Example usage
const videoUrl = 'https://www.youtube.com/watch?v=Qyx8v1xAs00';
const outputFilePath = 'video.mp4';

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
        const chat_id = update.message?.chatId;

        if (chat_id === undefined) {
            return;
        }

        console.log(update);

        const messageId = update.message.id;
        const messageContent: string = update.message.message;
        if (messageContent.match(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(?:-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?$/g)) {
            const outputFilePath = `build/storage/video_${messageId}.mp4`;
            await downloadVideo(messageContent, outputFilePath);

            console.log('sending video...')

            client.sendMessage(1, {buttons: })
            await client.sendFile(chat_id, {file: fs.createReadStream(outputFilePath).path})

            fs.unlink(outputFilePath, (err) => console.log(err));
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

