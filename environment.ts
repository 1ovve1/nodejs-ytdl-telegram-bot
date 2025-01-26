import * as dotenv from "dotenv";

type EnvironmentContract = {
    APP_ENV?: string;
    BOT_USERNAME?: string;
    BOT_TOKEN?: string;
    BOT_API_HASH?: string;
    BOT_API_ID?: string;
};
const environment: EnvironmentContract | undefined = dotenv.config().parsed;

if (!environment) {
    throw new Error('Environment is missing');
}

export default environment;