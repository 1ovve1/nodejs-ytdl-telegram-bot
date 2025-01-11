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

    onRun(video: Video,
          callback: () => Promise<void>,
          queueMovedCallback: (queueNumber: number) => Promise<void>,
          onError: (error: any) => Promise<void>): Promise<void>;

    pushAndRun(video: Video,
               callback: () => Promise<void>,
               queueMovedCallback: (queueNumber: number) => Promise<void>,
               onError: (error: any) => Promise<void>): Promise<void>;
}

export class VideoQueueService implements VideoQueueServiceInterface {
    readonly QUEUE_WAITING = 2000;
    readonly concurrency: number = 3;
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
            throw new Error('Queue is empty')
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
        this.queue = this.queue.filter(video => video.id !== videoId);
    }

    pushAndRun(video: Video, callback: () => Promise<void>, queueMovedCallback: (queueNumber: number) => Promise<void>, onError: (error: any) => Promise<void>): Promise<void> {
        this.push(video);

        return this.onRun(video, callback, queueMovedCallback, onError);
    }

    async onRun(video: Video,
                callback: () => Promise<void>,
                queueMovedCallback: (queueNumber: number) => Promise<void>,
                onError: (error: any) => Promise<void>): Promise<void> {
        const queueNumber = this.key(video);

        if (queueNumber === undefined) {
            await onError(new Error('Queue is empty'));

            return;
        }

        if (queueNumber >= this.concurrency) {
            if (queueMovedCallback !== undefined) {
                await queueMovedCallback(queueNumber - this.concurrency + 1);
            }

            setTimeout(
                () => this.waitVideo(queueNumber, video, callback, queueMovedCallback, onError),
                this.QUEUE_WAITING
            )
        } else if (queueNumber >= 0) {
            await callback();

            try {
                this.shift();
            } catch (_) {}
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
            await this.onRun(video, callback, queueMovedCallback, onError);
        }
    }
}