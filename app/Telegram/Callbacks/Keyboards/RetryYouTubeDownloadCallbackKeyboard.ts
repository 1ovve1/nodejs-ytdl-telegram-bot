import {AbstractCallbackKeyboard} from "./CallbackKeyboard";
import Video from "../../../../models/videos";
import {RetryYouTubeDownloadCallback} from "../RetryYouTubeDownloadCallback";

export class RetryYouTubeDownloadCallbackKeyboard extends AbstractCallbackKeyboard {
    constructor(video: Video) {
        super();

        this.addRow([
            new RetryYouTubeDownloadCallback().make("Повторить", video.id)
        ]);
    }
}