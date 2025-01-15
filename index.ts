import {App} from "./app/App";
import {StartCommand} from "./app/Telegram/Commands/StartCommand";
import {DatabaseHandler} from "./app/Telegram/Handlers/DatabaseHandler";
import environment from "./environment";
import {YouTubeLinkHandler} from "./app/Telegram/Handlers/YouTube/YouTubeLinkHandler";
import {DownloadVideoCallbackQuery} from "./app/Telegram/Callbacks/DownloadVideoCallbackQuery";
import {DownloadAudioCallbackQuery} from "./app/Telegram/Callbacks/DownloadAudioCallbackQuery";
import {CancelDownloadProcessCallback} from "./app/Telegram/Callbacks/CancelDownloadProcessCallback";
import {RefreshQueuePositionsCallback} from "./app/Telegram/Callbacks/RefreshQueuePositionsCallback";
import {QueueCommand} from "./app/Telegram/Commands/QueueCommand";
import {RetryYouTubeDownloadCallback} from "./app/Telegram/Callbacks/RetryYouTubeDownloadCallback";


const app = new App(
    String(environment?.BOT_TOKEN),
    Number(environment?.BOT_API_ID),
    String(environment?.BOT_API_HASH),
).setCommands([
    new StartCommand(),
    new QueueCommand(),
]).setHandlers([
    new DatabaseHandler(),
    new YouTubeLinkHandler()
]).setCallbackHandlers([
    new DownloadVideoCallbackQuery(),
    new DownloadAudioCallbackQuery(),
    new CancelDownloadProcessCallback(),
    new RefreshQueuePositionsCallback(),
    new RetryYouTubeDownloadCallback(),
]);


app.run();