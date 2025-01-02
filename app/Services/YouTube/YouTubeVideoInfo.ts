import {videoFormat, videoInfo} from "@distube/ytdl-core";
import {
    YouTubeVideoFormat,
    YouTubeVideoFormatChecker,
    YouTubeVideoFormatCheckerInterface,
    YouTubeVideoFormatInterface
} from "./YouTubeVideoFormat";

export interface YouTubeVideoInfoInterface {
    getDescription(): string;

    getFormats(): YouTubeVideoFormatInterface[];

    getFormatsChecker(): YouTubeVideoFormatCheckerInterface[];

    findInFormatsChecker(condition: (youTubeFormatChecker: YouTubeVideoFormatCheckerInterface) => Promise<boolean>): Promise<YouTubeVideoFormatInterface>;

    getTitle(): string;
}

export class YouTubeVideoInfoInterface implements YouTubeVideoInfoInterface {
    readonly videoInfo: videoInfo;

    constructor(videoInfo: videoInfo) {
        this.videoInfo = videoInfo;
    }

    getDescription(): string {
        return this.videoInfo.videoDetails.description ?? '';
    }

    getTitle(): string {
        return this.videoInfo.videoDetails.title ?? '';
    }

    getFormats(): YouTubeVideoFormatInterface[] {
        return this.videoInfo.formats.map((videoFormat: videoFormat): YouTubeVideoFormatInterface => new YouTubeVideoFormat(videoFormat))
    }

    getFormatsChecker(): YouTubeVideoFormatCheckerInterface[] {
        return this.videoInfo.formats.map((videoFormat: videoFormat) => YouTubeVideoFormatChecker.from(new YouTubeVideoFormat(videoFormat)));
    }

    async findInFormatsChecker(condition: (youTubeFormatChecker: YouTubeVideoFormatCheckerInterface) => Promise<boolean>): Promise<YouTubeVideoFormatInterface> {
        for (const formatChecker of this.getFormatsChecker()) {
            if (await condition(formatChecker)) {
                return Promise.resolve(formatChecker.getInstance())
            }
        }

        return Promise.reject()
    }
}