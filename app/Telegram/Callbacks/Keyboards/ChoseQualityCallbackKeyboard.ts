import {AbstractCallbackKeyboard, CallbackKeyboardInterface} from "./CallbackKeyboard";
import VideoFormat from "../../../../models/video_formats";
import AudioFormat from "../../../../models/audio_formats";
import {DownloadAudioCallbackQuery} from "../DownloadAudioCallbackQuery";
import {DownloadVideoCallbackQuery} from "../DownloadVideoCallbackQuery";

export class ChoseQualityCallbackKeyboard extends AbstractCallbackKeyboard implements CallbackKeyboardInterface {
    constructor(options: QualityOptions[]) {
        super();

        options.map(option => {
            if (option instanceof AudioFormat) {
                return new DownloadAudioCallbackQuery().make(option.label, option.id);
            } else {
                return new DownloadVideoCallbackQuery().make(option.label, option.id);
            }
        }).map(option => {
            this.addRow([option])
        });
    }
}

type QualityOptions = VideoFormat|AudioFormat;