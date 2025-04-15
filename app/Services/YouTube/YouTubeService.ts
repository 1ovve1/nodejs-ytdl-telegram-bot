import ytdl, {Agent, Cookie, videoFormat, videoInfo} from "@distube/ytdl-core";
import Video from "../../../models/videos";
import VideoFormat from "../../../models/video_formats";
import cookies from "./../../../cookies.json";
import { YouTubeVideoFormatCheckerInterface, YouTubeVideoFormatInterface } from "./YouTubeVideoFormat";
import {YouTubeVideoInfoInterface} from "./YouTubeVideoInfo";
import AudioFormat from "../../../models/audio_formats";
import {AudioFormatRepository} from "../../Repositories/AudioFormatRepository";


export interface YouTubeServiceInterface {
    getMetaDataFromVideoFormat(video: Video, videoFormatModel: VideoFormat): Promise<YouTubeVideoMetaDataInterface>;
    getMetaDataFromAudioFormat(video: Video, audioFormatModel: AudioFormat): Promise<YouTubeAudioMetaDataInterface>;

    getInfo(videoUrl: string): Promise<YouTubeVideoInfoInterface>

    findVideoFormatInFormats(videoInfo: YouTubeVideoInfoInterface, chosenYouTubeVideoFormat: YouTubeVideoFormatInterface): Promise<YouTubeVideoFormatInterface>;
    isVideoOk(videoInfo: YouTubeVideoInfoInterface, chosenYouTubeVideoFormat: YouTubeVideoFormatInterface): Promise<boolean>;
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

        const videoFormat = videoFormatModel.toVideoFormatEntity();
        const audioFormat: YouTubeVideoFormatInterface = (await new AudioFormatRepository().findFor(video)).toVideoFormatEntity();

        return {
            video,
            audioFormat,
            videoFormat
        } as YouTubeVideoMetaDataInterface;
    }

    async getMetaDataFromAudioFormat(video: Video, audioFormatModel: AudioFormat): Promise<YouTubeAudioMetaDataInterface> {
        console.log(`Download audio ${video.id}...`);

        const audioFormat: YouTubeVideoFormatInterface = audioFormatModel.toVideoFormatEntity();

        return {
            video,
            audioFormat,
        } as YouTubeAudioMetaDataInterface;
    }


    async getInfo(videoUrl: string): Promise<YouTubeVideoInfoInterface> {
        return new YouTubeVideoInfoInterface(await ytdl.getInfo(videoUrl, { agent: this.agent }));
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

    public async isVideoOk(videoInfo: YouTubeVideoInfoInterface, chosenYouTubeVideoFormat: YouTubeVideoFormatInterface): Promise<boolean> {
        try {
            await this.findVideoFormatInFormats(videoInfo, chosenYouTubeVideoFormat);

            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}

export interface YouTubeVideoMetaDataInterface {
    video: Video,
    videoFormat: YouTubeVideoFormatInterface;
    audioFormat: YouTubeVideoFormatInterface;
}

export interface YouTubeAudioMetaDataInterface {
    video: Video,
    audioFormat: YouTubeVideoFormatInterface;
}