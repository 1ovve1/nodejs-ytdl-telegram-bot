import db from "../../models";
import Video from "../../models/videos";
import {YouTubeVideoInfoInterface} from "../Services/YouTube/YouTubeVideoInfo";

export interface VideoRepositoryInterface {
    findById(id: number): Promise<Video>;

    create(youTubeVideoInfo: YouTubeVideoInfoInterface): Promise<Video>;

    delete(video: Video): Promise<void>;

    isExists(video: Video): Promise<boolean>;
}

export class VideoRepository implements VideoRepositoryInterface {
    async findById(id: number): Promise<Video> {
        const video = await db.Video.findOne({where: { id }});

        if (!video) {
            throw new Error("Video not found");
        }

        return video;
    }

    async create(youTubeVideoInfo: YouTubeVideoInfoInterface): Promise<Video>
    {
        return db.Video.create({
            url: youTubeVideoInfo.videoInfo.videoDetails.video_url,
            title: youTubeVideoInfo.videoInfo.videoDetails.title,
        });
    }

    async delete(video: Video): Promise<void> {
        await db.Video.destroy({where: { id: video.id }});
    }

    async isExists(video: Video): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.findById(video.id)

                return resolve(true);
            } catch (_) {
                return reject(false);
            }
        });
    }
}