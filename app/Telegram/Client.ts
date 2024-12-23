import {CommandInterface} from "./Commands/Command";
import {TelegramClient} from "telegram";
import {Session} from "telegram/sessions";
import {TelegramClientParams} from "telegram/client/telegramBaseClient";
import {BotAuthParams} from "telegram/client/auth";
import {NewMessageEvent} from "telegram/events";
import {MessageHandlerInterface} from "./Handlers/MessageHandler";
import {CallbackHandlerInterface} from "./Callbacks/CallbackHandler";
import {CallbackQueryEvent} from "telegram/events/CallbackQuery";

export interface ClientInterface {
    start(authParams: BotAuthParams): Promise<void>;
    addCommand(command: CommandInterface): this;
    addMessageHandler(handler: MessageHandlerInterface): this;
    addCallbackHandler(handler: CallbackHandlerInterface): this;
}

export class Client extends TelegramClient implements ClientInterface {
    constructor(session: string | Session, apiId: number, apiHash: string, clientParams: TelegramClientParams) {
        super(session, apiId, apiHash, clientParams);
    }

    async start(authParams: BotAuthParams): Promise<void> {
        await super.start(authParams);

        console.log(this.session.save());
    }

    addCommand(command: CommandInterface): this {
        this.addEventHandler(
            async (event: NewMessageEvent) => {
                if (event.message && event.message.message.startsWith(`/${command.name()}`)) {
                    await command.handle(event, this);
                }
            }
        )

        return this;
    }

    addMessageHandler(handler: MessageHandlerInterface): this {
        this.addEventHandler(
            async (event: NewMessageEvent) => {
                if (event.message && handler.match(event.message.message)) {
                    await handler.handle(event, this);
                }
            }
        );

        return this;
    }

    addCallbackHandler(handler: CallbackHandlerInterface): this {
        this.addEventHandler(
            async (event: CallbackQueryEvent): Promise<void> => {
                if (event.data && handler.match(event.data)) {
                    await handler.handle(event, this);
                }
            }
        );

        return this;
    }
}