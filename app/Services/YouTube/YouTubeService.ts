import ytdl, {Agent, Cookie, videoFormat, videoInfo} from "@distube/ytdl-core";
import Video from "../../../models/videos";
import VideoFormat from "../../../models/video_formats";
import ffmpeg from "fluent-ffmpeg"
import cookies from "./../../../cookies.json";
import { YouTubeVideoFormat, YouTubeVideoFormatCheckerInterface, YouTubeVideoFormatInterface } from "./YouTubeVideoFormat";
import {YouTubeVideoInfoInterface} from "./YouTubeVideoInfo";


export interface YouTubeServiceInterface {
    getMetaDataFrom(video: Video, format: VideoFormat): Promise<YouTubeMetaDataInterface>;

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

    async getMetaDataFrom(video: Video, format: VideoFormat): Promise<YouTubeMetaDataInterface> {

        return new Promise<YouTubeMetaDataInterface>(async (resolve: (result: YouTubeMetaDataInterface) => void, reject: (err: Error) => void): Promise<void> => {
            try {
                console.log(`Download video ${video.id}...`);

                const chosenYouTubeVideoFormat: YouTubeVideoFormatInterface = new YouTubeVideoFormat(JSON.parse(format.format) as videoFormat);

                const videoInfo: YouTubeVideoInfoInterface = await this.getInfo(video);
                const videoFormat: YouTubeVideoFormatInterface = await videoInfo.findInFormatsChecker(async (value: YouTubeVideoFormatCheckerInterface): Promise<boolean> => value.hasVideo().isQualityLabel(chosenYouTubeVideoFormat.getQualityLabel()).isQuality(chosenYouTubeVideoFormat.getQuality()).hasVideo().isUrlOk().check());
                const audioFormat: YouTubeVideoFormatInterface = await videoInfo.findInFormatsChecker(async (value: YouTubeVideoFormatCheckerInterface): Promise<boolean> => value.hasAudio().isAudioCodec('mp4a').isUrlOk().check());

                resolve({
                    videoInfo,
                    audioFormat,
                    videoFormat
                } as YouTubeMetaDataInterface)

            } catch (error) {
                console.error('Error downloading audio or video:', error);
            }
        })
    }

    async getFormats(video: Video): Promise<YouTubeVideoFormatInterface[]> {
        return (await this.getInfo(video)).getFormats();
    }

    async getInfo(video: Video): Promise<YouTubeVideoInfoInterface> {
        return new YouTubeVideoInfoInterface(await ytdl.getInfo(video.url, { agent: this.agent }));
    }
}

export interface YouTubeMetaDataInterface {
    videoInfo: YouTubeVideoInfoInterface;
    videoFormat: YouTubeVideoFormatInterface;
    audioFormat: YouTubeVideoFormatInterface;
}
