import Video from "../../../../models/videos";

export interface VideoQueueServiceInterface {
    push(video: Video): void;
    /**
     * @throws Error - queue is empty
     */
    shift(): Video;

    dropByKey(videoId: number): void;

    /**
     * @throws Error - object was not founded
     */
    key(video: Video): number | undefined;

    wait(video: Video,
         callback: () => Promise<void>,
         queueMovedCallback: (queueNumber: number) => Promise<void>,
         onError: (error: any) => Promise<void>): Promise<void>;
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

    key(object: Video): number | undefined {
        for (const [index, item] of this.queue.entries()) {
            if (object.id === item.id) {
                return index;
            }
        }

        return undefined;
    }

    dropByKey(videoId: number): void {
        this.queue = this.queue.filter(video => video.id !== video.id);
    }

    async wait(video: Video,
               callback: () => Promise<void>,
               queueMovedCallback: (queueNumber: number) => Promise<void>,
               onError: (error: any) => Promise<void>): Promise<void> {
        const queueNumber = this.key(video);

        if (queueNumber) {
            if (queueMovedCallback !== undefined) {
                await queueMovedCallback(queueNumber);
            }

            setTimeout(
                () => this.waitVideo(queueNumber, video, callback, queueMovedCallback, onError),
                this.QUEUE_WAITING
            )
        } else if (queueNumber === 0) {
            await callback();

            this.shift();
        } else {
            await onError(new Error("Queue timed out"));
        }
    }

    private async waitVideo(queueNumber: number,
                           video: Video,
                           callback: () => Promise<void>,
                           queueMovedCallback: (queueNumber: number) => Promise<void>,
                           onError: (error: any) => Promise<void>): Promise<void> {
        const newQueueNumber = this.key(video);

        if (newQueueNumber === queueNumber) {
            setTimeout(
                () => this.waitVideo(newQueueNumber, video, callback, queueMovedCallback, onError),
                this.QUEUE_WAITING
            )
        } else {
            await this.wait(video, callback, queueMovedCallback, onError);
        }
    }
}