import {CallbackHandlerInterface} from "./CallbackHandler";
import {Client} from "../Client";
import {VideoFormatRepository, VideoFormatRepositoryInterface} from "../../Repositories/VideoFormatRepository";
import {YouTubeMetaDataInterface, YouTubeService, YouTubeServiceInterface } from "../../Services/YouTube/YouTubeService";
import * as fs from "node:fs";
import {Api} from "telegram";
import UpdateBotCallbackQuery = Api.UpdateBotCallbackQuery;
import db from "../../../models";
import {FFmpegService, FFmpegServiceInterface} from "../../Services/FFmpeg/FFmpegService";
import {VideoQueueService, VideoQueueServiceInterface} from "../../Services/YouTube/VideoQueue/VideoQueueService";

export class DownloadVideoCallbackQuery implements CallbackHandlerInterface {
    readonly youTubeService: YouTubeServiceInterface = new YouTubeService();
    readonly videoQueueService: VideoQueueServiceInterface = VideoQueueService.make();

    readonly videoFormatRepository: VideoFormatRepositoryInterface = new VideoFormatRepository();
    readonly ffmpegService: FFmpegServiceInterface = new FFmpegService();

    async handle(event: UpdateBotCallbackQuery, client: Client): Promise<void> {
        if (event.data) {
            const videFormatId = Number(event.data.toString().replace("video_format:", ""));

            const videoFormat = await this.videoFormatRepository.findById(videFormatId);
            const video = await this.videoFormatRepository.video(videoFormat);

            this.videoQueueService.push(video);

            if (event.userId) {
                const user = await db.User.findOne({where: {tg_id: Number(event.userId)}});

                if (user === null) {
                    return;
                }

                await this.videoQueueService.wait(video, async () => {

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

                            let progressValueCache: number = 0;
                            const videoFileStream = await this.ffmpegService.combineAudioAndVideoFromYouTubeStream(
                                youTubeMetaData.videoFormat,
                                youTubeMetaData.audioFormat,
                                (progress) => {
                                    const newPercentageValue = Math.round(progress.percent ?? 0);

                                    if (progressValueCache !== newPercentageValue) {
                                        client.editMessage(user.username, {
                                            message: event.msgId,
                                            text: `${newPercentageValue}%...`,
                                        })
                                        progressValueCache = newPercentageValue;
                                    }
                                }
                            )

                            await client.editMessage(user.username, {
                                message: event.msgId,
                                text: `Выгрузка в телеграмм...`,
                            })

                            await client.sendMessage(user.username, {
                                message: youTubeMetaData.videoInfo.getDescription().substring(0, 250) + '...',
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
                }, async (queueNumber: number) => {
                    await client.editMessage(user.username, {
                        message: event.msgId,
                        text: `Ваша позиция в очереди: ${queueNumber}`,
                    })
                });
            }
        }
    }

    match(data: Buffer): boolean {
        return data.toString().includes("video_format:");
    }
}