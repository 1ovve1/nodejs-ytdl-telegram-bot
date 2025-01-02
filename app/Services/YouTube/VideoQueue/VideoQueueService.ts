import Video from "../../../../models/videos";

export interface VideoQueueServiceInterface {
    push(video: Video): void;
    /**
     * @throws Error - queue is empty
     */
    shift(): Video;

    /**
     * @throws Error - object was not founded
     */
    key(video: Video): number;

    wait(video: Video,
         callback: () => Promise<void>,
         queueMovedCallback: (queueNumber: number) => Promise<void>): Promise<void>;
}

export class VideoQueueService implements VideoQueueServiceInterface {
    readonly QUEUE_WAITING = 1000;

    private queue: Video[] = [];
    private static instance: VideoQueueService | null = null;

    static make(queue: Video[] = []): VideoQueueService
    {
        return this.instance ?? (this.instance = new VideoQueueService(queue));
    }

    private constructor(queue: Video[] = []) {
        this.queue = queue;
    }

    push(object: Video): void {
        this.queue.push(object);
    }

    shift(): Video {
        const value = this.queue.shift();

        if (value === undefined) {
            throw new Error('Queeu is empty')
        }

        return value;
    }

    key(object: Video): number {
        for (const [index, item] of this.queue.entries()) {
            if (object.id === item.id) {
                return index;
            }
        }

        throw new Error('object not found');
    }

    async wait(video: Video,
               callback: () => Promise<void>,
               queueMovedCallback: (queueNumber: number) => Promise<void>): Promise<void> {
        try {
            const queueNumber = this.key(video);

            if (queueNumber !== 0) {
                if (queueMovedCallback !== undefined) {
                    await queueMovedCallback(queueNumber);
                }

                setTimeout(
                    () => this.waitVideo(queueNumber, video, callback, queueMovedCallback),
                    this.QUEUE_WAITING
                )
            } else if (queueNumber === 0) {
                await callback();

                this.shift();
            }
        } catch (err) {
            return Promise.reject(err);
        }
    }

    private async waitVideo(queueNumber: number,
                           video: Video,
                           callback: () => Promise<void>,
                           queueMovedCallback: (queueNumber: number) => Promise<void>): Promise<void> {
        const newQueueNumber = this.key(video);

        if (newQueueNumber === queueNumber) {
            setTimeout(
                () => this.waitVideo(newQueueNumber, video, callback, queueMovedCallback),
                this.QUEUE_WAITING
            )
        } else {
            await this.wait(video, callback, queueMovedCallback);

        }
    }
}