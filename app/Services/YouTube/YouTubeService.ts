import ytdl, {videoFormat} from "@distube/ytdl-core";
import * as fs from "node:fs";
import Video from "../../../models/videos";
import videos from "../../../models/videos";
import VideoFormat from "../../../models/formats";
import ffmpeg from "fluent-ffmpeg"

export interface YouTubeServiceInterface {
    download(video: Video, format: VideoFormat): Promise<string>;

    getFormats(video: Video): Promise<videoFormat[]>;
}

export class YouTubeService implements YouTubeServiceInterface {

    readonly destinationPath: string = "build/storage";

    async download(video: Video, format: VideoFormat): Promise<string> {
        const videoOutPath: string = `${this.destinationPath}/video_${video.id}.mp4`;
        const audioOutPath: string = `${this.destinationPath}/audio_${video.id}.mp3`;
        const resultOutPath: string = `${this.destinationPath}/result_${video.id}.mp4`;


        return new Promise<string>((resolve: (result: string) => void, reject: (err: Error) => void): void => {
            try {
                // Download video
                ytdl(video.url, { format: JSON.parse(format.format) })
                    .pipe(fs.createWriteStream(videoOutPath))
                    .on('finish', async () => {
                        ytdl(video.url, { filter: "audioonly" })
                            .pipe(fs.createWriteStream(audioOutPath))
                            .on('finish', () => {
                                ffmpeg()
                                    .input(videoOutPath)
                                    .input(audioOutPath)
                                    .outputOptions('-c:v copy') // Copy video codec
                                    .outputOptions('-c:a aac', '-strict experimental') // Encode audio to AAC if not already
                                    .output(resultOutPath)
                                    .on('end', () => {
                                        console.log('Audio and Video combined successfully!');

                                        // Clean up the temporary files
                                        fs.unlinkSync(videoOutPath);
                                        fs.unlinkSync(audioOutPath);

                                        resolve(resultOutPath);
                                    })
                                    .on('error', (err: Error) => {
                                        console.error('Error during FFmpeg process:', err);

                                        reject(err);
                                    })
                                    .run();
                            });
                    });

                console.log('Audio and Video downloaded successfully.');
            } catch (error) {
                console.error('Error downloading audio or video:', error);
            }
        })
    }

    async getFormats(video: Video): Promise<videoFormat[]> {
        const videoInfo = await ytdl.getInfo(video.url);

        if (!videoInfo) {
            throw new Error("YouTube returns no video info");
        }

        return Promise.resolve(videoInfo.formats);
    }
}