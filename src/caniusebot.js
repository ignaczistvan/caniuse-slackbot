const logger = require('winston'); // TODO: Handle loglevel
const caniuse = require('caniuse-api');
const Bot = require('slackbots');
const slackMessageMapper = require('./utils/slackMessageMapper');
const isAddressedForBot = require('./utils/isAddressedForBot');

class CaniuseBot extends Bot {
  constructor(settings) {
    super(settings);

    this.settings = settings;
    this.settings.name = this.settings.name || 'caniusebot';
  }

  run() {
    this.on('start', this._onStart);
    this.on('message', this._onMessage);
  }

  _onStart() {
    this._loadBotUser();
    this.postMessageToUser('ignacz.istvan', 'Elindult a bot.');
    logger.info('Elindultunk.');
  }

  _loadBotUser() {
    this.user = this.users.filter(user => user.name === this.name)[0];
  }

  _onMessage(slackMessage) {
    if (isAddressedForBot(this, slackMessage)) {
      const message = slackMessageMapper(this, slackMessage);
      logger.info(message);
      this._replyAnswer(message);
      logger.info(`Új üzenet: ${slackMessage.text}`);
    }
  }

  _replyAnswer(originalMessage) {
    try {
      this.postMessage(originalMessage.target, caniuse.getSupport(originalMessage.body));
    } catch(e) {
      this.postMessage(originalMessage.target, caniuse.find(originalMessage.body));
    }
  }
}

module.exports = CaniuseBot;
