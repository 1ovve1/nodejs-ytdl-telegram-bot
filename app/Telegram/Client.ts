import {CommandInterface} from "./Commands/Command";
import {Api, TelegramClient} from "telegram";
import {Session} from "telegram/sessions";
import {TelegramClientParams} from "telegram/client/telegramBaseClient";
import {BotAuthParams} from "telegram/client/auth";
import {NewMessageEvent} from "telegram/events";
import {MessageHandlerInterface} from "./Handlers/MessageHandler";
import {CallbackHandlerInterface} from "./Callbacks/CallbackHandler";
import UpdateBotCallbackQuery = Api.UpdateBotCallbackQuery;
import {CallbackTelegramDataRepository, TelegramDataRepository} from "../Repositories/TelegramDataRepository";
import {TelegramService} from "../Services/Telegram/TelegramService";

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
                    const telegramData = new TelegramDataRepository(event.message);

                    await command.handle(new TelegramService(this, telegramData), telegramData);
                }
            }
        )

        return this;
    }

    addMessageHandler(handler: MessageHandlerInterface): this {
        this.addEventHandler(
            async (event: NewMessageEvent) => {
                if (event.message && handler.match(event.message.message)) {
                    const telegramData = new TelegramDataRepository(event.message);

                    await handler.handle(new TelegramService(this, telegramData), telegramData);
                }
            }
        );

        return this;
    }

    addCallbackHandler(handler: CallbackHandlerInterface): this {
        this.addEventHandler(
            async (event: UpdateBotCallbackQuery): Promise<void> => {
                if (event.data && handler.match(event.data)) {
                    const telegramData = new CallbackTelegramDataRepository(event);

                    await handler.handle(new TelegramService(this, telegramData), telegramData);
                }
            }
        );

        return this;
    }
}