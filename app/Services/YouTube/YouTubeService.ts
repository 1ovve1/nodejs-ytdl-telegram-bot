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
        const videoFormat: YouTubeVideoFormatInterface = await videoInfo.findInFormatsChecker(async (value: YouTubeVideoFormatCheckerInterface): Promise<boolean> => value.hasVideo().isQualityLabel(chosenYouTubeVideoFormat.getQualityLabel()).isQuality(chosenYouTubeVideoFormat.getQuality()).isUrlOk().check());
        const audioFormat: YouTubeVideoFormatInterface = await videoInfo.findInFormatsChecker(async (value: YouTubeVideoFormatCheckerInterface): Promise<boolean> => value.hasAudio().isAudioCodec('mp4a').isUrlOk().check());

        return {
            videoInfo,
            audioFormat,
            videoFormat
        } as YouTubeVideoMetaDataInterface;
    }

    async getMetaDataFromAudioFormat(video: Video, audioFormatModel: AudioFormat): Promise<YouTubeAudioMetaDataInterface> {
        console.log(`Download audio ${video.id}...`);

        const chosenAudioFormat: YouTubeVideoFormatInterface = new YouTubeVideoFormat(JSON.parse(audioFormatModel.format) as videoFormat);

        const videoInfo: YouTubeVideoInfoInterface = await this.getInfo(video);
        const audioFormat: YouTubeVideoFormatInterface = await videoInfo.findInFormatsChecker(async (value: YouTubeVideoFormatCheckerInterface): Promise<boolean> => value.hasAudio().isAudioBitrate(chosenAudioFormat.getAudioBitrate()).isUrlOk().check());

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