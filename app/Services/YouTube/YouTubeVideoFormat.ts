import {videoFormat} from "@distube/ytdl-core";
import {VideoFormatCreationAttributes} from "../../../models/video_formats";
import Video from "../../../models/videos";

type CallableCheck = () => Promise<boolean>;

export interface YouTubeVideoFormatInterface {
    hasVideo(): boolean;

    hasAudio(): boolean;

    isVideoCodec(codec: string): boolean;

    isAudioCodec(codec: string): boolean;

    isQuality(quality: string): boolean;

    isUrlOk(): Promise<boolean>;

    getVideoBitrate(): number;

    getAudioBitrate(): number;

    getQuality(): string;

    getUrl(): string;

    getQualityLabel(): string;

    toVideoFormatModel(video: Video): VideoFormatCreationAttributes;
}

export class YouTubeVideoFormat implements YouTubeVideoFormatInterface {
    readonly videoFormat: videoFormat;

    constructor(videoFormatInstance: videoFormat) {
        this.videoFormat = videoFormatInstance;
    }

    hasVideo(): boolean {
        return this.videoFormat.hasVideo;
    }

    hasAudio(): boolean {
        return this.videoFormat.hasAudio;
    }

    isQuality(quality: string): boolean {
        return this.videoFormat.quality === quality;
    }

    isVideoCodec(codec: string): boolean {
        return this.hasVideo() && Boolean(this.videoFormat.videoCodec?.startsWith(codec) ?? false)
    }

    isAudioCodec(codec: string): boolean {
        return this.hasAudio() && Boolean(this.videoFormat.audioCodec?.startsWith(codec) ?? false);
    }

    async isUrlOk(): Promise<boolean> {
        return (await fetch(this.getUrl())).ok;
    }

    getVideoBitrate(): number {
        return this.videoFormat.bitrate ?? 0;
    }

    getAudioBitrate(): number {
        return this.videoFormat.audioBitrate ?? 0;
    }

    getQualityLabel(): string {
        return this.videoFormat.qualityLabel ?? '';
    }

    getQuality(): string {
        return this.videoFormat.quality ?? '';
    }

    getUrl(): string {
        return this.videoFormat.url ?? '';
    }

    toVideoFormatModel(video: Video): VideoFormatCreationAttributes {
        return {
            video_id: video.id,
            format: JSON.stringify(this.videoFormat),
            label: `${this.getQualityLabel()} ${this.videoFormat.fps ?? 25}fps`,
        };
    }
}

export interface YouTubeVideoFormatCheckerInterface {
    hasVideo(): YouTubeVideoFormatCheckerInterface;

    hasAudio(): YouTubeVideoFormatCheckerInterface;

    isQuality(quality: string): YouTubeVideoFormatCheckerInterface;

    isVideoCodec(codec: string): YouTubeVideoFormatCheckerInterface;

    isAudioCodec(codec: string): YouTubeVideoFormatCheckerInterface;

    isUrlOk(): YouTubeVideoFormatCheckerInterface;

    check(): Promise<boolean>

    getInstance(): YouTubeVideoFormatInterface;
}

export class YouTubeVideoFormatChecker implements YouTubeVideoFormatCheckerInterface {
    readonly youTubeVideoFormat: YouTubeVideoFormatInterface
    readonly callbacksBuffer: CallableCheck[];

    static from(youTubeVideoFormat: YouTubeVideoFormatInterface): YouTubeVideoFormatCheckerInterface {
        return new this(youTubeVideoFormat);
    }

    private constructor(youTubeVideoFormat: YouTubeVideoFormatInterface, callbacksBuffer: CallableCheck[] = []) {
        this.youTubeVideoFormat = youTubeVideoFormat;
        this.callbacksBuffer = callbacksBuffer;
    }

    private static replicate(instance: YouTubeVideoFormatChecker): YouTubeVideoFormatCheckerInterface {
        return new this(instance.youTubeVideoFormat, instance.callbacksBuffer)
    }

    async check(): Promise<boolean> {
        let checkValue: boolean = true;

        for(const check of this.callbacksBuffer) {
            checkValue &&= await check();

            console.log(checkValue);

            if (!checkValue) {
                break;
            }
        }

        return checkValue;
    }

    hasVideo(): YouTubeVideoFormatCheckerInterface {
        this.setCallbacksBuffer(
            () => Promise.resolve(this.youTubeVideoFormat.hasVideo()),
        );

        return YouTubeVideoFormatChecker.replicate(this);
    }

    hasAudio(): YouTubeVideoFormatCheckerInterface {
        this.setCallbacksBuffer(
            () => Promise.resolve(this.youTubeVideoFormat.hasAudio()),
        );

        return YouTubeVideoFormatChecker.replicate(this);
    }

    isQuality(quality: string): YouTubeVideoFormatCheckerInterface {
        this.setCallbacksBuffer(
            () => Promise.resolve(this.youTubeVideoFormat.isQuality(quality))
        )

        return YouTubeVideoFormatChecker.replicate(this);
    }

    isVideoCodec(codec: string): YouTubeVideoFormatCheckerInterface {
        this.setCallbacksBuffer(
            () => Promise.resolve(this.youTubeVideoFormat.isVideoCodec(codec))
        );

        return YouTubeVideoFormatChecker.replicate(this);
    }

    isAudioCodec(codec: string): YouTubeVideoFormatCheckerInterface {
        this.setCallbacksBuffer(
            () => Promise.resolve(this.youTubeVideoFormat.isAudioCodec(codec))
        )

        return YouTubeVideoFormatChecker.replicate(this);
    }

    isUrlOk(): YouTubeVideoFormatCheckerInterface {
        this.setCallbacksBuffer(
            async () => await this.youTubeVideoFormat.isUrlOk()
        )

        return YouTubeVideoFormatChecker.replicate(this);
    }

    getInstance(): YouTubeVideoFormatInterface {
        return this.youTubeVideoFormat;
    }

    private setCallbacksBuffer(callback: CallableCheck): void {
        this.callbacksBuffer.push(callback);
    }

}