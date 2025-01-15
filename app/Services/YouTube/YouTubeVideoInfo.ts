import {videoFormat, videoInfo} from "@distube/ytdl-core";
import {
    YouTubeVideoFormat,
    YouTubeVideoFormatChecker,
    YouTubeVideoFormatCheckerInterface,
    YouTubeVideoFormatInterface
} from "./YouTubeVideoFormat";
import videos from "../../../models/videos";
import {it} from "node:test";

export interface YouTubeVideoInfoInterface {
    getDescription(): string;

    getFormats(): YouTubeVideoFormatInterface[];

    getFormatsChecker(): YouTubeVideoFormatCheckerInterface[];

    getTitle(): string;

    getTimeMarkers(): string;

    findInFormatsChecker(condition: (youTubeFormatChecker: YouTubeVideoFormatCheckerInterface) => Promise<boolean>): Promise<YouTubeVideoFormatInterface>;
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

    getTimeMarkers(): string {
        // @ts-ignore
        const response: videoInfoResponse | undefined = this.videoInfo.response;

        if (response) {
            const engagementPanels = response?.engagementPanels;

            if (engagementPanels) {
                for (const engagementPanel of engagementPanels) {
                    const identifier = engagementPanel.engagementPanelSectionListRenderer.panelIdentifier;

                    if (identifier === "engagement-panel-macro-markers-description-chapters") {
                        return engagementPanel.engagementPanelSectionListRenderer
                            .content
                            .macroMarkersListRenderer
                            .contents
                            .reduce((acc, item) => acc += `${item.macroMarkersListItemRenderer.timeDescription.simpleText} - ${item.macroMarkersListItemRenderer.title.simpleText}\n`, '')
                    }
                }
            }
        }

        return '';
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

type videoInfoResponse = {
    engagementPanels?: EngagementPanels[]
}

type EngagementPanels = {
    engagementPanelSectionListRenderer: {
        "panelIdentifier"?: string,
        content: {
            macroMarkersListRenderer: {
                contents: MacroMarkerListItem[]
            }
        }
    }
}

type MacroMarkerListItem = {
    "macroMarkersListItemRenderer": {
        "title": {
            "simpleText": string,
        },
        "timeDescription": {
            "simpleText": string,
        },
    }
};
