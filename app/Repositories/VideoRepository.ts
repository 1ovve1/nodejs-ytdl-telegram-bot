import db from "../../models";
import Video from "../../models/videos";

export interface VideoRepositoryInterface {
    findById(id: number): Promise<Video>;

    findOrCreate(url: string): Promise<Video>;

    create(url: string): Promise<Video>;

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