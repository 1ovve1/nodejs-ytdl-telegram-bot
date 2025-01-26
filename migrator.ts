require('ts-node/register');

import {SequelizeStorage, Umzug} from "umzug";
import sequelize from "./sequelize.js";

const umzug = new Umzug({
    migrations: {glob: 'migrations/*.ts'},
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({sequelize}),
    logger: console,
})

exports.umzug = umzug;

if (require.main === module) {
    umzug.runAsCLI();
}