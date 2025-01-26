import {Options, Sequelize} from 'sequelize';
import ConfigJson from './config/config.json';
import environment from "./environment";

type ConfigurationContract = {development: Options, test: Options, production: Options};

const Config = ConfigJson as ConfigurationContract;

let sequelize: Sequelize;

console.log(process.env.BOT_TOKEN);
switch (environment?.APP_ENV) {
    case 'development':
        sequelize = new Sequelize(Config.development);
        break;
    case 'test':
        sequelize = new Sequelize(Config.test);
        break;
    case 'production':
        sequelize = new Sequelize(Config.production);
        break;
    default:
        throw new Error('Sequelize configuration is missing');
}


export default sequelize;