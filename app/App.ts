import {StringSession} from "telegram/sessions";
import {Client} from "./Telegram/Client";
import {CommandInterface} from "./Telegram/Commands/Command";
import {MessageHandlerInterface} from "./Telegram/Handlers/MessageHandler";
import {CallbackHandlerInterface} from "./Telegram/Callbacks/CallbackHandler";

export interface AppInterface {
    _botToken: string;
    _botApiId: number;
    _botApiHash: string;
    _stringSession: string;

    run(): void;
    setCommands(commands: CommandInterface[]): this;
    setHandlers(handlers: MessageHandlerInterface[]): this;
    setCallbackHandlers(handlers: CallbackHandlerInterface[]): this;
}

export class App implements AppInterface {
    _botToken: string;
    _botApiId: number;
    _botApiHash: string;
    _stringSession: string;

    _commands: CommandInterface[] = [];
    _handlers: MessageHandlerInterface[] = [];
    _callbacks: CallbackHandlerInterface[] = [];

    constructor(botToken: string, botApiId: number, botApiHash: string) {
        this._botToken = botToken;
        this._botApiId = botApiId;
        this._botApiHash = botApiHash;
        this._stringSession = "";
    }

    async run(): Promise<void> {
        const client = new Client(
            new StringSession(this._stringSession),
            this._botApiId,
            this._botApiHash,
            { connectionRetries: 5 }
        );

        await client.start({
            botAuthToken: this._botToken,
        });

        this._commands.map((command: CommandInterface) => {
            client.addCommand(command);
        });

        this._handlers.map((handler: MessageHandlerInterface) => {
            client.addMessageHandler(handler);
        })

        this._callbacks.forEach((handler: CallbackHandlerInterface) => {
            client.addCallbackHandler(handler);
        })
    }

    setCommands(commands: CommandInterface[]): this {
        this._commands = commands;

        return this;
    }

    setHandlers(handlers: MessageHandlerInterface[]): this {
        this._handlers = handlers;

        return this;
    }

    setCallbackHandlers(handlers: CallbackHandlerInterface[]): this {
        this._callbacks = handlers;

        return this;
    }
}