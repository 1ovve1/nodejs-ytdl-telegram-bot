import {App} from "./app/App";
import {StartCommand} from "./app/Telegram/Commands/StartCommand";
import {DatabaseHandler} from "./app/Telegram/Handlers/DatabaseHandler";
import environment from "./environment";
import {YouTubeLinkHandler} from "./app/Telegram/Handlers/YouTube/YouTubeLinkHandler";
import {DownloadVideoCallbackQuery} from "./app/Telegram/Callbacks/DownloadVideoCallbackQuery";
import {YouTubeService, YouTubeServiceInterface} from "./app/Services/YouTube/YouTubeService";
import db from "./models";



const app = new App(
    String(environment?.BOT_TOKEN),
    Number(environment?.BOT_API_ID),
    String(environment?.BOT_API_HASH),
).setCommands([
    new StartCommand()
]).setHandlers([
    new DatabaseHandler(),
    new YouTubeLinkHandler()
]).setCallbackHandlers([
    new DownloadVideoCallbackQuery()
]);


// app.run();

(async () => {
    const youTubeService: YouTubeServiceInterface = new YouTubeService();

    const video = (await db.Video.findAll())[0];
    const videFormat = (await db.VideoFormat.findAll({where: {video_id: video.id}}))[0]

    if (videFormat) {
        await youTubeService.download(video, videFormat);
    }
})();

// const BOT_TOKEN: string = process.env.BOT_TOKEN ?? '';
// const BOT_API_ID: number = parseInt(process.env.BOT_API_ID ?? '');
// const BOT_API_HASH: string = process.env.BOT_API_HASH ?? ''
//
// const youtubeLinkRegex: RegExp = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(?:-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?$/g;
//
// const stringSessions: string = '';
//
// (async () => {
//     const testUrl: string = "https://www.youtube.com/watch?v=vmoPjrmrtU4&ab_channel=%E3%83%87%E3%83%BC%E3%83%A2%E3%83%B3Astari";
//     console.log((await getInfo(testUrl)));
// })();
//
// (async () => {
//     const client = new TelegramClient(
//         new StringSession(stringSessions),
//         BOT_API_ID,
//         BOT_API_HASH,
//         { connectionRetries: 5 }
//     );
//
//     await client.start({
//         botAuthToken: BOT_TOKEN,
//     });
//
//     console.log(client.session.save());
//
//     client.addEventHandler(async (update: NewMessageEvent) => {
//         const requestChatId = update.message?.chatId;
//
//         if (requestChatId === undefined) {
//             return;
//         }
//
//         const requestMessageId = update.message.id;
//         const requestMessageContent: string = update.message.message;
//
//         if (requestMessageContent.match(youtubeLinkRegex)) {
//             const outputFilePath = `build/storage/video_${requestMessageId}.mp4`;
//
//             const progressMessage: Message = await client.sendMessage(requestChatId, { message: "Загружаем..." })
//
//             await downloadVideo(requestMessageContent, outputFilePath);
//
//             try {
//                 await progressMessage.edit({text: "Отправляем..."})
//
//                 await client.sendMessage(requestChatId, { replyTo: requestMessageId, file: fs.createReadStream(outputFilePath).path, message: "Готово!" })
//
//                 await progressMessage.delete();
//             } catch(err: any) {
//                 console.error(err);
//             } finally {
//                 fs.unlink(outputFilePath, (err) => console.log(err));
//             }
//         }
//     })
// });
//
// async function getInfo(url: string): Promise<videoInfo>
// {
//     return await ytdl.getInfo(url);
// }
//
// async function downloadVideo(url: string, outputFilePath: string): Promise<void>
// {
//     return new Promise(((resolve: () => void, reject: (err: Error) => void) => {
//         // Get the video and audio streams
//         ytdl(url, { filter: 'videoandaudio', quality: "hd1080" , })
//             .pipe(fs.createWriteStream(outputFilePath))
//             .on('finish', () => {
//                 resolve()
//             })
//             .on('error', (err: Error) => {
//                 reject(err);
//             });
//     }));
// }
//
