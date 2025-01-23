import VideoFormat from "../../models/video_formats";
import Video from "../../models/videos";
import Videos from "../../models/videos";
import {
    YouTubeVideoFormatInterface
} from "../Services/YouTube/YouTubeVideoFormat";
import AudioFormat from "../../models/audio_formats";

export interface AudioFormatRepositoryInterface {
    create(video: Video, youTubeVideoFormat: YouTubeVideoFormatInterface[]): Promise<AudioFormat>
    findById(id: number): Promise<AudioFormat>;
    findAllFor(video: Video): Promise<AudioFormat[]>;
    existsFor(video: Video): Promise<boolean>;

    video(videoFormat: VideoFormat): Promise<Video>;
}

export class AudioFormatRepository implements AudioFormatRepositoryInterface {
    readonly MAX_FILE_SIZE_BYTES: number = 2048 * 1024 * 1024;

    async create(video: Video, youTubeVideoFormatInterfaces: YouTubeVideoFormatInterface[]): Promise<AudioFormat> {
        const formats: AudioFormat = await AudioFormat.create(
                youTubeVideoFormatInterfaces.filter((youTubeVideoFormat: YouTubeVideoFormatInterface) => youTubeVideoFormat.hasAudio() && youTubeVideoFormat.getSize() < this.MAX_FILE_SIZE_BYTES)
                    .sort((element: YouTubeVideoFormatInterface, comparable: YouTubeVideoFormatInterface) => element.getAudioBitrate() - comparable.getAudioBitrate())
                    .map((videoFormat: YouTubeVideoFormatInterface) => videoFormat.toAudioFormatModel(video)).pop()
        );

        return Promise.resolve(formats);
    }

    async findById(id: number): Promise<AudioFormat> {
        const format = await AudioFormat.findOne({where: {id: id}})

        if (!format) {
            return Promise.reject(id);
        }

        return Promise.resolve(format);
    }

    async findAllFor(video: Video): Promise<AudioFormat[]> {
        const formats = await AudioFormat.findAll({where: {video_id: video.id}})

        return Promise.resolve(formats);
    }

    async existsFor(video: Video): Promise<boolean> {
        const exists = await AudioFormat.findOne({where: {video_id: video.id}})

        if (exists) {
            return Promise.resolve(true);
        } else {
            return Promise.resolve(false);
        }
    }

    async video(videoFormat: VideoFormat): Promise<Video> {
        const video = await Videos.findOne({where: {id: videoFormat.video_id}})

        if (!video) {
            return Promise.reject(videoFormat);
        }

        return Promise.resolve(video);
    }
}