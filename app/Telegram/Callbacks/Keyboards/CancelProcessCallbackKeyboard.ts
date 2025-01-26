import {AbstractCallbackKeyboard} from "./CallbackKeyboard";
import {CancelDownloadProcessCallback} from "../CancelDownloadProcessCallback";
import Video from "../../../../models/videos";

export class CancelProcessCallbackKeyboard extends AbstractCallbackKeyboard {
    constructor(video: Video) {
        super();
        this.addRow([
            new CancelDownloadProcessCallback().make("Отмена", video.id)
        ])
    }
}

