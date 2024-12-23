import VideoFormat from "../../models/formats";
import Video from "../../models/videos";
import {videoFormat} from "@distube/ytdl-core";
import Videos from "../../models/videos";

export interface VideoFormatRepositoryInterface {
    createMany(video: Video, videoFormats: videoFormat[]): Promise<VideoFormat[]>
    findById(id: number): Promise<VideoFormat>;
    findAllFor(video: Video): Promise<VideoFormat[]>;
    existsFor(video: Video): Promise<boolean>;

    video(videoFormat: VideoFormat): Promise<Video>;
}

export class VideoFormatRepository implements VideoFormatRepositoryInterface {
    async createMany(video: Video, videoFormats: videoFormat[]): Promise<VideoFormat[]> {
        const formats: VideoFormat[] = await VideoFormat.bulkCreate(
            Array.from(
                videoFormats.filter((videoFormat: videoFormat) => Boolean(videoFormat.hasVideo))
                    .sort((element: videoFormat, comparable: videoFormat) => (element.bitrate ?? 0) - (comparable.bitrate ?? 0))
                    .reduce((a, b) => a.has(b.qualityLabel) ? a: a.set(b.qualityLabel, b), new Map<string, videoFormat>())
                    .values()
            ).map(format => ({
                video_id: video.id,
                format: JSON.stringify(format),
                label: `video: ${format.qualityLabel} ${format.fps ?? 25}fps`,
            }))
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