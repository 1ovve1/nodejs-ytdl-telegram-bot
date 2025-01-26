import {AbstractCallbackHandler} from "./CallbackHandler";
import {TelegramServiceInterface} from "../../Services/Telegram/TelegramService";
import {TelegramDataRepositoryInterface} from "../../Repositories/TelegramDataRepository";
import Video from "../../../models/videos";
import {ChoseQualityCallbackKeyboard} from "./Keyboards/ChoseQualityCallbackKeyboard";
import {YouTubeService, YouTubeServiceInterface} from "../../Services/YouTube/YouTubeService";
import {VideoRepository, VideoRepositoryInterface} from "../../Repositories/VideoRepository";
import {VideoFormatRepository, VideoFormatRepositoryInterface} from "../../Repositories/VideoFormatRepository";
import {AudioFormatRepository, AudioFormatRepositoryInterface} from "../../Repositories/AudioFormatRepository";

export class RetryYouTubeDownloadCallback extends AbstractCallbackHandler {
    readonly prefix: string = "retry_video:";

    readonly youtubeService: YouTubeServiceInterface = new YouTubeService();

    readonly videoRepository: VideoRepositoryInterface = new VideoRepository();
    readonly videoFormatRepository: VideoFormatRepositoryInterface = new VideoFormatRepository();
    readonly audioFormatRepository: AudioFormatRepositoryInterface = new AudioFormatRepository();

    async handle(telegramService: TelegramServiceInterface, telegramData: TelegramDataRepositoryInterface): Promise<void> {
        const videoId: number = Number(this.getDataFromRaw(telegramData.getMessageContent()));

        const video: Video = await this.videoRepository.findById(videoId);

        const formats = [
            ...await this.videoFormatRepository.findAllFor(video),
            ...await this.audioFormatRepository.findAllFor(video),
        ];

        await telegramService.editMessage({content: "Выберите качество:", keyboard: new ChoseQualityCallbackKeyboard(formats)})
    }
}