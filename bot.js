const CaniuseBot = require('./src/caniusebot');
const helloController = require('./src/controllers/hello');
const defaultController = require('./src/controllers/default');
const logger = require('winston');

const token = process.env.BOT_API_KEY;
const name = process.env.BOT_NAME;
const admins = process.env.ADMINS ? process.env.ADMINS.split(',') : [];
logger.level = process.env.LOG_LEVEL || 'debug';

const caniuseBot = new CaniuseBot({ token, name, admins, logger });
caniuseBot.addController(helloController);
caniuseBot.addController(defaultController);
caniuseBot.run();
