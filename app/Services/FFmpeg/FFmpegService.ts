import {ReadStream} from "node:fs";
import { throttle } from "throttle-debounce";
import ffmpeg from "fluent-ffmpeg";
import {YouTubeVideoFormatInterface} from "../YouTube/YouTubeVideoFormat";
import * as fs from "node:fs";

export interface FFmpegServiceInterface {
    combineAudioAndVideoFromYouTubeStream(
        videoFormat: YouTubeVideoFormatInterface,
        audioFormat: YouTubeVideoFormatInterface,
        onProgress: (progress: FFmpegProgressEvent) => void | undefined
    ): Promise<ReadStream>;
}

export class FFmpegService implements FFmpegServiceInterface {
    readonly destinationPath: string = "build/storage";

    async combineAudioAndVideoFromYouTubeStream(
        videoFormat: YouTubeVideoFormatInterface,
        audioFormat: YouTubeVideoFormatInterface,
        onProgress: (progress: FFmpegProgressEvent) => void | undefined
    ): Promise<ReadStream>
    {
        const resultOutPath: string = `${this.destinationPath}/result_${Date.now().toString()}.mp4`;

        return new Promise<ReadStream>((resolve, reject) => {
            const onProgressThrottle = throttle(1000, (progress: FFmpegProgressEvent) => {
                if (onProgress) {
                    onProgress(progress);
                }
            })

            ffmpeg()
                .input(videoFormat.getUrl())
                .input(audioFormat.getUrl())
                .outputOptions('-c:v copy')
                .outputOptions('-c:a aac')
                .output(resultOutPath)
                .outputFormat('mp4')
                .on('progress', (progress: FFmpegProgressEvent) => {
                    onProgressThrottle(progress);
                })
                .on('end', () => {
                    onProgressThrottle.cancel();

                    console.log('Audio and Video combined successfully!');

                    resolve(fs.createReadStream(resultOutPath));
                })
                .on('error', (err: Error) => {
                    console.error('Error during FFmpeg process:', err);

                    reject(err);
                })
                .run();
        })
    }
}

export type FFmpegProgressEvent = {
    frames: number;
    currentFps: number;
    currentKbps: number;
    targetSize: number;
    timemark: string;
    percent?: number | undefined;
};