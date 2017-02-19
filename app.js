const CaniuseBot = require('./src/caniusebot');
const controller = require('./src/controllers/controller');
const logger = require('winston');

const token = process.env.BOT_API_KEY;
const name = process.env.BOT_NAME;
logger.level = process.env.LOG_LEVEL || 'debug';

const caniuseBot = new CaniuseBot({ token, name, logger });
caniuseBot.addController(controller);
caniuseBot.run();
