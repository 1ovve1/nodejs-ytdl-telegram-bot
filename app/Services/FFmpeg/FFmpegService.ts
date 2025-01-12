import {ReadStream} from "node:fs";
import { throttle } from "throttle-debounce";
import ffmpeg, {FfmpegCommand} from "fluent-ffmpeg";
import * as fs from "node:fs";
import cookies from "./../../../cookies.json";
import {YouTubeAudioMetaDataInterface, YouTubeVideoMetaDataInterface} from "../YouTube/YouTubeService";

export interface FFmpegServiceInterface {
    combineAudioAndVideoFromYouTubeStream(
        videoMetaData: YouTubeVideoMetaDataInterface,
        onProgress: FFmpegProgressEvent
    ): Promise<ReadStream>;

    downloadFromAudioFormat(audioMetaData: YouTubeAudioMetaDataInterface,
                            onProgress: FFmpegProgressEvent): Promise<ReadStream>;
}

export class FFmpegService implements FFmpegServiceInterface {
    readonly delayTime: number = 3000;
    readonly destinationPath: string = "build/storage";
    readonly cookies: string = '';

    constructor() {
        this.cookies = cookies
            .map((cookie) => `${cookie.name}=${cookie.value}`)
            .join("; ");
    }

    async combineAudioAndVideoFromYouTubeStream(
        videoMetaData: YouTubeVideoMetaDataInterface,
        onProgress: FFmpegProgressEvent = async () => {}
    ): Promise<ReadStream>
    {
        const resultOutPath: string = `${this.destinationPath}/result_${Date.now().toString()}.mp4`;

        return new Promise<ReadStream>((resolve, reject) => {
            const onProgressThrottle = throttle(this.delayTime, (progress: FFmpegProgressEventData, command: FfmpegCommand) => {
                onProgress(progress, command).catch((err: Error) => {
                    reject(err);
                    fs.unlink(resultOutPath, () => {});
                });
            })

            let oldProgressValue: number = 0;
            const command = ffmpeg()
                .input(videoMetaData.videoFormat.getUrl())
                .addInputOption('-cookies', this.cookies)
                .input(videoMetaData.audioFormat.getUrl())
                .addInputOption('-cookies', this.cookies)
                .outputOptions('-c:v copy')
                .outputOptions('-c:a aac')
                .output(resultOutPath)
                .outputFormat('mp4')
                .on('progress', (progress: FFmpegProgressEventData) => {
                    progress.percent = Math.round(progress.percent ?? 0);

                    if (oldProgressValue !== progress.percent) {
                        onProgressThrottle(progress, command);

                        oldProgressValue = progress.percent;
                    }
                })
                .on('end', () => {
                    onProgressThrottle.cancel();

                    console.log('Audio and Video download and combined successfully!');

                    resolve(fs.createReadStream(resultOutPath));
                })
                .on('error', (err: Error) => {
                    console.error('Error during FFmpeg process:', err);

                    reject(err);
                });

            command.run();
        })
    }

    async downloadFromAudioFormat(audioMetaData: YouTubeAudioMetaDataInterface,
                                  onProgress: FFmpegProgressEvent = async () => {}): Promise<ReadStream> {
        const resultOutPath: string = `${this.destinationPath}/${audioMetaData.videoInfo.getTitle()}.mp3`;

        return new Promise<ReadStream>((resolve, reject) => {
            const onProgressThrottle = throttle(this.delayTime, (progress: FFmpegProgressEventData, command: FfmpegCommand) => {
                onProgress(progress, command).catch((err) => {
                    reject(err);
                    fs.unlink(resultOutPath, () => {});
                });
            })

            let oldProgressValue: number = 0;
            const command = ffmpeg(audioMetaData.audioFormat.getUrl())
                .addInputOption('-cookies', this.cookies)
                .audioCodec('libmp3lame')   // Set the audio codec to MP3 (libmp3lame)
                .audioChannels(2)        // Set stereo audio (2 channels)
                .audioFrequency(44100)   // Set audio frequency (44.1 kHz)
                .audioBitrate(audioMetaData.audioFormat.getAudioBitrate())
                .output(resultOutPath)
                .format('mp3')           // Set output format to WAV
                .on('progress', (progress: FFmpegProgressEventData) => {
                    progress.percent = Math.round(progress.percent ?? 0);

                    if (oldProgressValue !== progress.percent) {
                        onProgressThrottle(progress, command);

                        oldProgressValue = progress.percent;
                    }
                })
                .on('end', () => {
                    onProgressThrottle.cancel();

                    console.log('Audio download successfully!');

                    resolve(fs.createReadStream(resultOutPath));
                })
                .on('error', (err: Error) => {
                    console.error('Error during FFmpeg process:', err);

                    reject(err);
                });

            command.run();
        })
    }
}

export type FFmpegProgressEventData = {
    frames: number;
    currentFps: number;
    currentKbps: number;
    targetSize: number;
    timemark: string;
    percent?: number | undefined;
};

export type FFmpegProgressEvent = (progress: FFmpegProgressEventData, command: FfmpegCommand) => Promise<void>;