import {ReadStream} from "node:fs";
import { throttle } from "throttle-debounce";
import ffmpeg from "fluent-ffmpeg";
import {YouTubeVideoFormatInterface} from "../YouTube/YouTubeVideoFormat";
import * as fs from "node:fs";
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
    readonly destinationPath: string = "build/storage";

    async combineAudioAndVideoFromYouTubeStream(
        videoMetaData: YouTubeVideoMetaDataInterface,
        onProgress: FFmpegProgressEvent
    ): Promise<ReadStream>
    {
        const resultOutPath: string = `${this.destinationPath}/result_${Date.now().toString()}.mp4`;

        return new Promise<ReadStream>((resolve, reject) => {
            const onProgressThrottle = throttle(2000, (progress: FFmpegProgressEventData) => {
                if (onProgress) {
                    onProgress(progress);
                }
            })

            ffmpeg()
                .input(videoMetaData.videoFormat.getUrl())
                .input(videoMetaData.audioFormat.getUrl())
                .outputOptions('-c:v copy')
                .outputOptions('-c:a aac')
                .output(resultOutPath)
                .outputFormat('mp4')
                .on('progress', (progress: FFmpegProgressEventData) => {
                    onProgressThrottle(progress);
                })
                .on('end', () => {
                    onProgressThrottle.cancel();

                    console.log('Audio and Video download and combined successfully!');

                    resolve(fs.createReadStream(resultOutPath));
                })
                .on('error', (err: Error) => {
                    console.error('Error during FFmpeg process:', err);

                    reject(err);
                })
                .run();
        })
    }

    async downloadFromAudioFormat(audioMetaData: YouTubeAudioMetaDataInterface, onProgress: FFmpegProgressEvent): Promise<ReadStream> {
        const resultOutPath: string = `${this.destinationPath}/${audioMetaData.videoInfo.getTitle()}.mp3`;

        return new Promise<ReadStream>((resolve, reject) => {
            const onProgressThrottle = throttle(2000, (progress: FFmpegProgressEventData) => {
                if (onProgress) {
                    onProgress(progress);
                }
            })

            ffmpeg(audioMetaData.audioFormat.getUrl())
                .audioCodec('libmp3lame')   // Set the audio codec to MP3 (libmp3lame)
                .audioChannels(2)        // Set stereo audio (2 channels)
                .audioFrequency(44100)   // Set audio frequency (44.1 kHz)
                .audioBitrate(audioMetaData.audioFormat.getAudioBitrate())
                .output(resultOutPath)
                .format('mp3')           // Set output format to WAV
                .on('progress', (progress: FFmpegProgressEventData) => {
                    onProgressThrottle(progress);
                })
                .on('end', () => {
                    onProgressThrottle.cancel();

                    console.log('Audio download successfully!');

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

export type FFmpegProgressEventData = {
    frames: number;
    currentFps: number;
    currentKbps: number;
    targetSize: number;
    timemark: string;
    percent?: number | undefined;
};

export type FFmpegProgressEvent = (progress: FFmpegProgressEventData) => void | undefined;