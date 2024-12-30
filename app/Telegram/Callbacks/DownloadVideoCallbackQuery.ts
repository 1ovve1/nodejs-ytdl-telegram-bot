import {CallbackHandlerInterface} from "./CallbackHandler";
import {Client} from "../Client";
import {VideoFormatRepository, VideoFormatRepositoryInterface} from "../../Repositories/VideoFormatRepository";
import {YouTubeMetaDataInterface, YouTubeService, YouTubeServiceInterface } from "../../Services/YouTube/YouTubeService";
import * as fs from "node:fs";
import {Api} from "telegram";
import UpdateBotCallbackQuery = Api.UpdateBotCallbackQuery;
import db from "../../../models";
import {FFmpegService, FFmpegServiceInterface} from "../../Services/FFmpeg/FFmpegService";

export class DownloadVideoCallbackQuery implements CallbackHandlerInterface {
    readonly videoFormatRepository: VideoFormatRepositoryInterface = new VideoFormatRepository();
    readonly youTubeService: YouTubeServiceInterface = new YouTubeService();
    readonly ffmpegService: FFmpegServiceInterface = new FFmpegService();

    async handle(event: UpdateBotCallbackQuery, client: Client): Promise<void> {
        if (event.data) {
            const videFormatId = Number(event.data.toString().replace("video_format:", ""));

            const videoFormat = await this.videoFormatRepository.findById(videFormatId);
            const video = await this.videoFormatRepository.video(videoFormat);

            if (event.userId) {
                const user = await db.User.findOne({where: {tg_id: Number(event.userId)}});

                if (user === null) {
                    return;
                }

                try {
                    await client.editMessage(user.username, {
                        message: event.msgId,
                        text: "Загружаю метаданные...",
                    })

                    const youTubeMetaData: YouTubeMetaDataInterface = await this.youTubeService.getMetaDataFrom(video, videoFormat);

                    await client.editMessage(user.username, {
                        message: event.msgId,
                        text: "Начинаю загрузку...",
                    })

                    let progressValue: number = 0;
                    const videoFileStream = await this.ffmpegService.combineAudioAndVideoFromYouTubeStream(
                        youTubeMetaData.videoFormat,
                        youTubeMetaData.audioFormat,
                        (progress) => {

                            if (progressValue !== progress.percent) {
                                client.editMessage(user.username, {
                                    message: event.msgId,
                                    text: `${progressValue}%...`,
                                })
                                progressValue = Math.round(progressValue ?? 0);
                            }
                        }
                    )

                    await client.editMessage(user.username, {
                        message: event.msgId,
                        text: `Выгрузка в телеграмм...`,
                    })

                    await client.sendMessage(user.username, {
                        message: youTubeMetaData.videoInfo.getDescription().substring(0, 100) + '...',
                        file: videoFileStream.path,
                    })

                    fs.unlinkSync(videoFileStream.path);

                    await client.deleteMessages(user.username, [event.msgId], { revoke: true });
                } catch (err) {
                    await client.editMessage(user.username, {
                        message: event.msgId,
                        text: "Произошла ошибка :(",
                    })
                } finally {
                    await db.Video.destroy({where: { id: video.id }});
                }
            }
        }
    }

    match(data: Buffer): boolean {
        return data.toString().includes("video_format:");
    }
}