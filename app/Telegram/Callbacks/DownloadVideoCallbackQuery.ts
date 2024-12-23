import {CallbackHandlerInterface} from "./CallbackHandler";
import {CallbackQueryEvent} from "telegram/events/CallbackQuery";
import {Client} from "../Client";
import {VideoFormatRepository, VideoFormatRepositoryInterface} from "../../Repositories/VideoFormatRepository";
import videos from "../../../models/videos";
import {YouTubeService, YouTubeServiceInterface} from "../../Services/YouTube/YouTubeService";
import * as fs from "node:fs";

export class DownloadVideoCallbackQuery implements CallbackHandlerInterface{
    readonly videoFormatRepository: VideoFormatRepositoryInterface = new VideoFormatRepository();
    readonly youTubeService: YouTubeServiceInterface = new YouTubeService();

    async handle(event: CallbackQueryEvent, client: Client): Promise<void> {
        if (event.data) {
            const videFormatId = Number(event.data.toString().replace("video_format:", ""));

            const videoFormat = await this.videoFormatRepository.findById(videFormatId);
            const video = await this.videoFormatRepository.video(videoFormat);

            const path: string = await this.youTubeService.download(video, videoFormat);

            event.answer({message: "Загрузка завершена! Начата выгрузка..."})

            if (event.chatId) {
                await client.sendMessage(event.chatId, {
                    file: fs.createReadStream(path).path,
                })
            }
        }
    }

    match(data: Buffer): boolean {
        return data.toString().includes("video_format:");
    }
}