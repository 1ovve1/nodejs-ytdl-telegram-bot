import {ButtonLike, MarkupLike} from "telegram/define";

export interface CallbackKeyboardInterface {
    make(): MarkupLike
}

export abstract class AbstractCallbackKeyboard implements CallbackKeyboardInterface {
    private buttons: ButtonLike[][] = [];

    protected addRow(buttons: ButtonLike[]): AbstractCallbackKeyboard
    {
        this.buttons.push(buttons)
        return this;
    }

    make(): MarkupLike {
        return this.buttons;
    }
}