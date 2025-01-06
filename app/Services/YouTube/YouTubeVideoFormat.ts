import {videoFormat} from "@distube/ytdl-core";
import {VideoFormatCreationAttributes} from "../../../models/video_formats";
import Video from "../../../models/videos";
import {AudioFormatCreationAttributes} from "../../../models/audio_formats";

type CallableCheck = () => Promise<boolean>;

export interface YouTubeVideoFormatInterface {
    getInstance(): videoFormat;

    hasVideo(): boolean;

    hasAudio(): boolean;

    isVideoCodec(codec: string): boolean;

    isAudioCodec(codec: string): boolean;

    isAudioBitrate(audioBitrate: number): boolean;

    isQuality(quality: string): boolean;

    isQualityLabel(qualityLabel: string): boolean;

    isMimeType(mimeType: string): boolean;

    isUrlOk(): Promise<boolean>;

    getVideoBitrate(): number;

    getAudioBitrate(): number;

    getQuality(): string;

    getUrl(): string;

    getQualityLabel(): string;

    toVideoFormatModel(video: Video): VideoFormatCreationAttributes;

    toAudioFormatModel(video: Video): AudioFormatCreationAttributes;
}

export class YouTubeVideoFormat implements YouTubeVideoFormatInterface {
    readonly videoFormat: videoFormat;

    constructor(videoFormatInstance: videoFormat) {
        this.videoFormat = videoFormatInstance;
    }

    getInstance(): videoFormat {
        return this.videoFormat;
    }

    isMimeType(mimeType: string): boolean {
        return this.hasVideo() && Boolean(this.videoFormat.mimeType?.startsWith(mimeType));
    }

    hasVideo(): boolean {
        return this.videoFormat.hasVideo ?? false;
    }

    hasAudio(): boolean {
        return this.videoFormat.hasAudio ?? false;
    }

    isQuality(quality: string): boolean {
        return this.getQuality() === quality;
    }

    isQualityLabel(qualityLabel: string): boolean {
        return this.getQualityLabel() === qualityLabel;
    }

    isVideoCodec(codec: string): boolean {
        return this.hasVideo() && Boolean(this.videoFormat.videoCodec?.startsWith(codec) ?? false)
    }

    isAudioCodec(codec: string): boolean {
        return this.hasAudio() && Boolean(this.videoFormat.audioCodec?.startsWith(codec) ?? false);
    }

    isAudioBitrate(audioBitrate: number): boolean {
        return this.hasAudio() && this.getAudioBitrate() === audioBitrate;
    }

    async isUrlOk(): Promise<boolean> {
        try {
            return (await fetch(this.getUrl())).ok;
        } catch (err) {
            return false;
        }
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

    toAudioFormatModel(video: Video): AudioFormatCreationAttributes {
        return {
            video_id: video.id,
            format: JSON.stringify(this.videoFormat),
            label: `Only Audio`,
        };
    }
}

export interface YouTubeVideoFormatCheckerInterface {
    hasVideo(): YouTubeVideoFormatCheckerInterface;

    hasAudio(): YouTubeVideoFormatCheckerInterface;

    isQuality(quality: string): YouTubeVideoFormatCheckerInterface;

    isQualityLabel(qualityLabel: string): YouTubeVideoFormatCheckerInterface;

    isVideoCodec(codec: string): YouTubeVideoFormatCheckerInterface;

    isAudioCodec(codec: string): YouTubeVideoFormatCheckerInterface;

    isMimeType(mimeType: string): YouTubeVideoFormatCheckerInterface;

    isAudioBitrate(audioBitrate: number): YouTubeVideoFormatCheckerInterface

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

    isQualityLabel(qualityLabel: string): YouTubeVideoFormatCheckerInterface {
        this.setCallbacksBuffer(
            () => Promise.resolve(this.youTubeVideoFormat.isQualityLabel(qualityLabel))
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

    isMimeType(mimeType: string): YouTubeVideoFormatCheckerInterface {
        this.setCallbacksBuffer(
            () => Promise.resolve(this.youTubeVideoFormat.isMimeType(mimeType))
        )

        return YouTubeVideoFormatChecker.replicate(this);
    }

    isAudioBitrate(audioBitrate: number): YouTubeVideoFormatCheckerInterface {
        this.setCallbacksBuffer(
            () => Promise.resolve(this.youTubeVideoFormat.isAudioBitrate(audioBitrate))
        );

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