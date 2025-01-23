import {AbstractCallbackKeyboard, CallbackKeyboardInterface} from "./CallbackKeyboard";
import VideoFormat from "../../../../models/video_formats";
import AudioFormat from "../../../../models/audio_formats";
import {DownloadAudioCallbackQuery} from "../DownloadAudioCallbackQuery";
import {DownloadVideoCallbackQuery} from "../DownloadVideoCallbackQuery";
import {FileHelper} from "../../../Helpers/FileHelper";

export class ChoseQualityCallbackKeyboard extends AbstractCallbackKeyboard implements CallbackKeyboardInterface {
    constructor(options: QualityOptions[]) {
        super();

        const audioFormat = options.find((value) => value instanceof AudioFormat);

        options.map(option => {
            if (option instanceof AudioFormat) {
                return new DownloadAudioCallbackQuery().make(`~${option.label} (${option.humanizeFileSize()})`, option.id);
            } else {
                if (audioFormat === undefined) {
                    return new DownloadVideoCallbackQuery().make(`~${option.label} (${option.humanizeFileSize()})`, option.id);
                } else {
                    return new DownloadVideoCallbackQuery().make(`~${option.label} (${FileHelper.resolveHumanizeFileSizeByGivenBytes(option.size + audioFormat.size)})`, option.id);
                }
            }
        }).map(option => {
            this.addRow([option])
        });
    }
}

type QualityOptions = VideoFormat|AudioFormat;