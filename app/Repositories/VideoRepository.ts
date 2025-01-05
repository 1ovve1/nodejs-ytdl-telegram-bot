import db from "../../models";
import Video from "../../models/videos";

export interface VideoRepositoryInterface {
    findOrCreate(url: string): Promise<Video>;
    create(url: string): Promise<Video>;

    delete(video: Video): Promise<void>;
}

export class VideoRepository implements VideoRepositoryInterface {
    async findOrCreate(url: string): Promise<Video> {
        const video: Video | null = await db.Video.findOne({
            where: { url }
        });

        if (video === null) {
            return Video.create({
                url
            })
        }

        return Promise.resolve(video);
    }

    async create(url: string): Promise<Video>
    {
        return db.Video.create({
            url
        });
    }

    async delete(video: Video): Promise<void> {
        await db.Video.destroy({where: { id: video.id }});
    }
}