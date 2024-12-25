import ytdl, {Agent, Cookie, videoFormat, videoInfo} from "@distube/ytdl-core";
import Video from "../../../models/videos";
import VideoFormat from "../../../models/video_formats";
import ffmpeg from "fluent-ffmpeg"
import cookies from "./../../../cookies.json";
import { YouTubeVideoFormat, YouTubeVideoFormatCheckerInterface, YouTubeVideoFormatInterface } from "./YouTubeVideoFormat";
import {YouTubeVideoInfoInterface} from "./YouTubeVideoInfo";

export interface StoredYouTubeVideoInterface {
    destination: string;
    info: YouTubeVideoInfoInterface;
}

export interface YouTubeServiceInterface {
    download(video: Video, format: VideoFormat): Promise<StoredYouTubeVideoInterface>;

    getFormats(video: Video): Promise<YouTubeVideoFormatInterface[]>;
    getInfo(vide: Video): Promise<YouTubeVideoInfoInterface>
}

export class YouTubeService implements YouTubeServiceInterface {

    readonly destinationPath: string = "build/storage";

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

    async download(video: Video, format: VideoFormat): Promise<StoredYouTubeVideoInterface> {
        const resultOutPath: string = `${this.destinationPath}/result_${video.id}.mp4`;

        return new Promise<StoredYouTubeVideoInterface>(async (resolve: (result: StoredYouTubeVideoInterface) => void, reject: (err: Error) => void): Promise<void> => {
            try {
                console.log(`Download video: ${video.id}.mp4...`);

                const chosenYouTubeVideoFormat: YouTubeVideoFormatInterface = new YouTubeVideoFormat(JSON.parse(format.format) as videoFormat);

                const youTubeVideoInfo: YouTubeVideoInfoInterface = await this.getInfo(video);

                const videoFormat: YouTubeVideoFormatInterface = await youTubeVideoInfo.findInFormatsChecker(async (value: YouTubeVideoFormatCheckerInterface): Promise<boolean> => value.hasVideo().isQualityLabel(chosenYouTubeVideoFormat.getQualityLabel()).isQuality(chosenYouTubeVideoFormat.getQuality()).isVideoCodec('H.264').isUrlOk().check());
                const audioFormat: YouTubeVideoFormatInterface = await youTubeVideoInfo.findInFormatsChecker(async (value: YouTubeVideoFormatCheckerInterface): Promise<boolean> => value.hasAudio().isAudioCodec('mp4a').isUrlOk().check());

                ffmpeg()
                    .input(videoFormat.getUrl())
                    .input(audioFormat.getUrl())
                    .outputOptions('-c:v copy')
                    .outputOptions('-c:a aac')
                    .output(resultOutPath)
                    .outputFormat('mp4')
                    .on('end', () => {
                        console.log('Audio and Video combined successfully!');

                        resolve({
                            destination: resultOutPath,
                            info: youTubeVideoInfo
                        } as StoredYouTubeVideoInterface);
                    })
                    .on('error', (err: Error) => {
                        console.error('Error during FFmpeg process:', err);

                        reject(err);
                    })
                    .run();

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