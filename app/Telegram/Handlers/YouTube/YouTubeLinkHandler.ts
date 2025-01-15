import {MessageHandlerInterface} from "../MessageHandler";
import {Api} from "telegram";
import {YouTubeService, YouTubeServiceInterface} from "../../../Services/YouTube/YouTubeService";
import {VideoRepository, VideoRepositoryInterface} from "../../../Repositories/VideoRepository";
import Video from "../../../../models/videos";
import {VideoFormatRepository, VideoFormatRepositoryInterface} from "../../../Repositories/VideoFormatRepository";
import {AudioFormatRepository, AudioFormatRepositoryInterface} from "../../../Repositories/AudioFormatRepository";
import {TelegramServiceInterface} from "../../../Services/Telegram/TelegramService";
import {TelegramDataRepositoryInterface} from "../../../Repositories/TelegramDataRepository";
import {ChoseQualityCallbackKeyboard} from "../../Callbacks/Keyboards/ChoseQualityCallbackKeyboard";

export class YouTubeLinkHandler implements MessageHandlerInterface {
    readonly YOUTUBE_LINK_REG: RegExp = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(?:-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?$/g;

    readonly youtubeService: YouTubeServiceInterface = new YouTubeService();

    readonly videoRepository: VideoRepositoryInterface = new VideoRepository();
    readonly videoFormatRepository: VideoFormatRepositoryInterface = new VideoFormatRepository();
    readonly audioFormatRepository: AudioFormatRepositoryInterface = new AudioFormatRepository();

    async handle(telegramService: TelegramServiceInterface, telegramData: TelegramDataRepositoryInterface): Promise<void> {
        const videoUrl: string = telegramData.getMessageContent();

        const video: Video = await this.videoRepository.create(videoUrl);

        const formats = await this.youtubeService.getFormats(video);

        const videoFormats = await this.videoFormatRepository.createMany(video, formats);
        const audioFormat = await this.audioFormatRepository.create(video, formats);

        await telegramService.replyTo({content: "Выберите качество:", keyboard: new ChoseQualityCallbackKeyboard([...videoFormats, audioFormat])})
    }

    match(messageData: string): boolean {
        return Boolean(messageData.match(this.YOUTUBE_LINK_REG));
    }
}