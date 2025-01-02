import {MessageHandlerInterface} from "../MessageHandler";
import {NewMessageEvent} from "telegram/events";
import {Api} from "telegram";
import Client = Api.Client;
import KeyboardButtonRow = Api.KeyboardButtonRow;
import ReplyInlineMarkup = Api.ReplyInlineMarkup;
import KeyboardButtonCallback = Api.KeyboardButtonCallback;
import {YouTubeService, YouTubeServiceInterface} from "../../../Services/YouTube/YouTubeService";
import {VideoRepository, VideoRepositoryInterface} from "../../../Repositories/VideoRepository";
import Video from "../../../../models/videos";
import VideoFormat from "../../../../models/video_formats";
import {VideoFormatRepository, VideoFormatRepositoryInterface} from "../../../Repositories/VideoFormatRepository";
import {AudioFormatRepository, AudioFormatRepositoryInterface} from "../../../Repositories/AudioFormatRepository";

export class YouTubeLinkHandler implements MessageHandlerInterface {
    readonly YOUTUBE_LINK_REG: RegExp = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(?:-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?$/g;

    readonly youtubeService: YouTubeServiceInterface = new YouTubeService();

    readonly videoRepository: VideoRepositoryInterface = new VideoRepository();
    readonly videoFormatRepository: VideoFormatRepositoryInterface = new VideoFormatRepository();
    readonly audioFormatRepository: AudioFormatRepositoryInterface = new AudioFormatRepository();

    async handle(event: NewMessageEvent, client: Client): Promise<void> {
        const videoUrl: string = event.message.message;

        if (!videoUrl) {
            return;
        }

        const video: Video = await this.videoRepository.create(videoUrl);

        const formats = await this.youtubeService.getFormats(video);

        const videoFormats = await this.videoFormatRepository.createMany(video, formats);
        const audioFormat = await this.audioFormatRepository.create(video, formats);

        const rows = videoFormats.map(format => new KeyboardButtonRow({
            buttons: [
                new KeyboardButtonCallback({
                    text: format.label,
                    data: Buffer.from(`video_format:${format.id}`),
                })
            ]
        }));

        rows.push(new KeyboardButtonRow({
            buttons: [
                new KeyboardButtonCallback({
                    text: audioFormat.label,
                    data: Buffer.from(`audio_format:${audioFormat.id}`)
                })
            ]
        }));

        await client.sendMessage(event.message.chatId, {
            replyTo: event.message.id,
            message: "Выберите качество:",
            buttons: new ReplyInlineMarkup({
                rows
            })
        });
    }

    match(messageData: string): boolean {
        return Boolean(messageData.match(this.YOUTUBE_LINK_REG));
    }
}