const CaniuseBot = require('./src/caniusebot');

const token = process.env.BOT_API_KEY;
const name = process.env.BOT_NAME;

const caniuseBot = new CaniuseBot({ token, name });

caniuseBot.run();
