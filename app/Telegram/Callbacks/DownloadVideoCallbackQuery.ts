import {CallbackHandlerInterface} from "./CallbackHandler";
import {CallbackQueryEvent} from "telegram/events/CallbackQuery";
import {Client} from "../Client";
import {VideoFormatRepository, VideoFormatRepositoryInterface} from "../../Repositories/VideoFormatRepository";
import {StoredYouTubeVideoInterface, YouTubeService, YouTubeServiceInterface } from "../../Services/YouTube/YouTubeService";
import * as fs from "node:fs";
import {Api} from "telegram";
import UpdateBotCallbackQuery = Api.UpdateBotCallbackQuery;

export class DownloadVideoCallbackQuery implements CallbackHandlerInterface {
    readonly videoFormatRepository: VideoFormatRepositoryInterface = new VideoFormatRepository();
    readonly youTubeService: YouTubeServiceInterface = new YouTubeService();

    async handle(event: UpdateBotCallbackQuery, client: Client): Promise<void> {
        if (event.data) {
            const videFormatId = Number(event.data.toString().replace("video_format:", ""));

            const videoFormat = await this.videoFormatRepository.findById(videFormatId);
            const video = await this.videoFormatRepository.video(videoFormat);

            const storedYouTubeVideo: StoredYouTubeVideoInterface = await this.youTubeService.download(video, videoFormat);

            if (event.chatInstance) {
                await client.sendMessage(event.chatInstance, {
                    message: storedYouTubeVideo.info.getDescription(),
                    file: fs.createReadStream(storedYouTubeVideo.destination).path,
                })

                fs.unlinkSync(storedYouTubeVideo.destination);

                await client.deleteMessages(event.chatInstance, [event.msgId], { revoke: true });
            }
        }
    }

    match(data: Buffer): boolean {
        return data.toString().includes("video_format:");
    }
}