import VideoFormat from "../../models/video_formats";
import Video from "../../models/videos";
import {videoFormat} from "@distube/ytdl-core";
import Videos from "../../models/videos";
import {
    YouTubeVideoFormat,
    YouTubeVideoFormatChecker,
    YouTubeVideoFormatInterface
} from "../Services/YouTube/YouTubeVideoFormat";

export interface VideoFormatRepositoryInterface {
    createMany(video: Video, youTubeVideoFormat: YouTubeVideoFormatInterface[]): Promise<VideoFormat[]>
    findById(id: number): Promise<VideoFormat>;
    findAllFor(video: Video): Promise<VideoFormat[]>;
    existsFor(video: Video): Promise<boolean>;

    video(videoFormat: VideoFormat): Promise<Video>;
}

export class VideoFormatRepository implements VideoFormatRepositoryInterface {
    readonly MAX_FILE_SIZE_BYTES: number = 2048 * 1024 * 1024;

    async createMany(video: Video, youTubeVideoFormatInterfaces: YouTubeVideoFormatInterface[]): Promise<VideoFormat[]> {
        const formats: VideoFormat[] = await VideoFormat.bulkCreate(
            Array.from(
                youTubeVideoFormatInterfaces.filter((youTubeVideoFormat: YouTubeVideoFormatInterface) => youTubeVideoFormat.hasVideo() && youTubeVideoFormat.hasThumbnails() && youTubeVideoFormat.getSize() < this.MAX_FILE_SIZE_BYTES)
                    .sort((element: YouTubeVideoFormatInterface, comparable: YouTubeVideoFormatInterface) => element.getVideoBitrate() - comparable.getVideoBitrate())
                    .reduce((map: Map<string, YouTubeVideoFormatInterface>, element: YouTubeVideoFormatInterface): Map<string, YouTubeVideoFormatInterface> => map.has(element.getQualityLabel()) ? map: map.set(element.getQualityLabel(), element), new Map<string, YouTubeVideoFormatInterface>())
                    .values()
            ).map((videoFormat: YouTubeVideoFormatInterface) => videoFormat.toVideoFormatModel(video))
        );

        return Promise.resolve(formats);
    }

    async findById(id: number): Promise<VideoFormat> {
        const format = await VideoFormat.findOne({where: {id: id}})

        if (!format) {
            return Promise.reject(id);
        }

        return Promise.resolve(format);
    }

    async findAllFor(video: Video): Promise<VideoFormat[]> {
        const formats = await VideoFormat.findAll({where: {video_id: video.id}})

        return Promise.resolve(formats);
    }

    async existsFor(video: Video): Promise<boolean> {
        const exists = await VideoFormat.findOne({where: {video_id: video.id}})

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