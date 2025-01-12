import {AbstractCallbackKeyboard} from "./CallbackKeyboard";
import {RefreshQueuePositionsCallback} from "../RefreshQueuePositionsCallback";

export class RefreshQueuePositionsCallbackKeyboard extends AbstractCallbackKeyboard {
    constructor() {
        super();

        this.addRow([new RefreshQueuePositionsCallback().make("Обновить ♻️", "refresh_queue")])
    }
}