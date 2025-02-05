import ytdl, {Agent, Cookie, videoFormat, videoInfo} from "@distube/ytdl-core";
import Video from "../../../models/videos";
import VideoFormat from "../../../models/video_formats";
import cookies from "./../../../cookies.json";
import { YouTubeVideoFormat, YouTubeVideoFormatCheckerInterface, YouTubeVideoFormatInterface } from "./YouTubeVideoFormat";
import {YouTubeVideoInfoInterface} from "./YouTubeVideoInfo";
import AudioFormat from "../../../models/audio_formats";


export interface YouTubeServiceInterface {
    getMetaDataFromVideoFormat(video: Video, videoFormatModel: VideoFormat): Promise<YouTubeVideoMetaDataInterface>;
    getMetaDataFromAudioFormat(video: Video, audioFormatModel: AudioFormat): Promise<YouTubeAudioMetaDataInterface>;

    getFormats(video: Video): Promise<YouTubeVideoFormatInterface[]>;
    getInfo(vide: Video): Promise<YouTubeVideoInfoInterface>

    findVideoFormatInFormats(videoInfo: YouTubeVideoInfoInterface, chosenYouTubeVideoFormat: YouTubeVideoFormatInterface): Promise<YouTubeVideoFormatInterface>;
}

export class YouTubeService implements YouTubeServiceInterface {
    private readonly agentOptions: object;
    private readonly cookies: Cookie[];
    private readonly agent: Agent;

    constructor() {
        this.agentOptions = {
            userAgent: 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            pipelining: 5,
            maxRedirections: 5,
        }
        this.cookies = cookies as Cookie[];
        this.agent = ytdl.createAgent(this.cookies, this.agentOptions);
    }

    async getMetaDataFromVideoFormat(video: Video, videoFormatModel: VideoFormat): Promise<YouTubeVideoMetaDataInterface> {
        console.log(`Download video ${video.id}...`);

        const chosenYouTubeVideoFormat: YouTubeVideoFormatInterface = new YouTubeVideoFormat(JSON.parse(videoFormatModel.format) as videoFormat);

        const videoInfo: YouTubeVideoInfoInterface = await this.getInfo(video);

        const videoFormat = await this.findVideoFormatInFormats(videoInfo, chosenYouTubeVideoFormat);
        const audioFormat: YouTubeVideoFormatInterface = await this.findAudioFormatInFormats(videoInfo);

        return {
            videoInfo,
            audioFormat,
            videoFormat
        } as YouTubeVideoMetaDataInterface;
    }

    async getMetaDataFromAudioFormat(video: Video, audioFormatModel: AudioFormat): Promise<YouTubeAudioMetaDataInterface> {
        console.log(`Download audio ${video.id}...`);

        const videoInfo: YouTubeVideoInfoInterface = await this.getInfo(video);
        const audioFormat: YouTubeVideoFormatInterface = await this.findAudioFormatInFormats(videoInfo);

        return {
            videoInfo,
            audioFormat,
        } as YouTubeAudioMetaDataInterface;
    }


    async getFormats(video: Video): Promise<YouTubeVideoFormatInterface[]> {
        return (await this.getInfo(video)).getFormats();
    }

    async getInfo(video: Video): Promise<YouTubeVideoInfoInterface> {
        return new YouTubeVideoInfoInterface(await ytdl.getInfo(video.url, { agent: this.agent }));
    }

    private async findAudioFormatInFormats(videoInfo: YouTubeVideoInfoInterface): Promise<YouTubeVideoFormatInterface> {
        const audioFormat: YouTubeVideoFormatInterface | undefined = videoInfo
            .getFormats()
            .sort((a, b) => b.getAudioBitrate() - a.getAudioBitrate())
            .find(async value => await value.isUrlOk());

        if (audioFormat === undefined) {
            throw new Error("Cannot find audio file");
        }

        return audioFormat
    }

    public async findVideoFormatInFormats(videoInfo: YouTubeVideoInfoInterface, chosenYouTubeVideoFormat: YouTubeVideoFormatInterface): Promise<YouTubeVideoFormatInterface> {
        let videoFormat: YouTubeVideoFormatInterface;
        // try to get H.264 codec for better performance
        const qualityLabel = `${chosenYouTubeVideoFormat.getQualityLabel().split('p')[0]}p`;

        try {
            videoFormat = await videoInfo.findInFormatsChecker(async (value: YouTubeVideoFormatCheckerInterface): Promise<boolean> =>
                value.hasVideo().isQualityLabel(qualityLabel).isVideoCodec("H.264").isUrlOk().check());
        } catch (error) {
            try {
                videoFormat = await videoInfo.findInFormatsChecker(async (value: YouTubeVideoFormatCheckerInterface): Promise<boolean> =>
                    value.hasVideo().isQualityLabel(chosenYouTubeVideoFormat.getQualityLabel()).isUrlOk().check());
            } catch (error) {
                videoFormat = await videoInfo.findInFormatsChecker(async (value: YouTubeVideoFormatCheckerInterface): Promise<boolean> =>
                    value.hasVideo().isQualityLabel(qualityLabel).isUrlOk().check());
            }
        }

        return videoFormat ?? chosenYouTubeVideoFormat;
    }
}

export interface YouTubeVideoMetaDataInterface {
    videoInfo: YouTubeVideoInfoInterface;
    videoFormat: YouTubeVideoFormatInterface;
    audioFormat: YouTubeVideoFormatInterface;
}

export interface YouTubeAudioMetaDataInterface {
    videoInfo: YouTubeVideoInfoInterface;
    audioFormat: YouTubeVideoFormatInterface;
}