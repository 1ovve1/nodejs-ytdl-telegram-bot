import {MessageHandlerInterface} from "../MessageHandler";
import {NewMessageEvent} from "telegram/events";
import {Api} from "telegram";
import Client = Api.Client;
import {videoFormat} from "@distube/ytdl-core";
import KeyboardButtonRow = Api.KeyboardButtonRow;
import ReplyInlineMarkup = Api.ReplyInlineMarkup;
import KeyboardButtonCallback = Api.KeyboardButtonCallback;
import {YouTubeService, YouTubeServiceInterface} from "../../../Services/YouTube/YouTubeService";
import {VideoRepository, VideoRepositoryInterface} from "../../../Repositories/VideoRepository";
import Video from "../../../../models/videos";
import VideoFormat from "../../../../models/formats";
import {VideoFormatRepository, VideoFormatRepositoryInterface} from "../../../Repositories/VideoFormatRepository";
import {forwardMessages} from "telegram/client/messages";

export class YouTubeLinkHandler implements MessageHandlerInterface {
    readonly YOUTUBE_LINK_REG: RegExp = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(?:-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?$/g;

    readonly youtubeService: YouTubeServiceInterface = new YouTubeService();
    readonly videoRepository: VideoRepositoryInterface = new VideoRepository();
    readonly formatRepository: VideoFormatRepositoryInterface = new VideoFormatRepository();

    async handle(event: NewMessageEvent, client: Client): Promise<void> {
        const videoUrl: string = event.message.message;

        if (!videoUrl) {
            return;
        }

        const video: Video = await this.videoRepository.findOrCreate(videoUrl);
        let formats: VideoFormat[];

        if (await this.formatRepository.existsFor(video)) {
            formats = await this.formatRepository.findAllFor(video);
        } else {
            const videoFormats = await this.youtubeService.getFormats(video);

            formats = await this.formatRepository.createMany(video, videoFormats);
        }

        const rows = formats.map(format => new KeyboardButtonRow({
            buttons: [
                new KeyboardButtonCallback({
                    text: format.label,
                    data: Buffer.from(`video_format:${format.id}`),
                })
            ]
        }));

        await client.sendMessage(event.message.chatId, {
            replyTo: event.message.id,
            message: "Video",
            buttons: new ReplyInlineMarkup({
                rows
            })
        });
    }

    match(messageData: string): boolean {
        return Boolean(messageData.match(this.YOUTUBE_LINK_REG));
    }
}