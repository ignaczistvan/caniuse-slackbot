const logger = require('winston'); // TODO: Handle loglevel
const caniuse = require('caniuse-api');
const Bot = require('slackbots');
const Controller = require('./controller');
const slackMessageMapper = require('./utils/slackMessageMapper');
const isAddressedForBot = require('./utils/isAddressedForBot');

class CaniuseBot extends Bot {
  constructor(settings) {
    super(settings);

    this.settings = settings;
    this.settings.name = this.settings.name || 'caniusebot';
    this.conversations = new Map();
    this.controller = new Controller(this.conversations);
  }

  run() {
    this.on('start', this._onStart);
    this.on('message', this._onMessage);
  }

  _onStart() {
    this.user = this.users.filter(user => user.name === this.name)[0];
    this.postMessageToUser('ignacz.istvan', 'Elindult a bot.');
    logger.info('Elindultunk.');
  }

  _onMessage(slackMessage) {
    if (!isAddressedForBot(this, slackMessage)) return;
    logger.info(`Új üzenet: ${slackMessage.text}`);
    const message = slackMessageMapper(this, slackMessage);
    this._reply(this.controller.onMessage(message));
  }

  _reply(res) {
    this.postMessage(res.target, res.body, res.params);
  }
}

module.exports = CaniuseBot;
