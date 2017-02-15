const logger = require('winston'); // TODO: Handle loglevel
const Bot = require('slackbots');
const MessageHelper = require('./messagehelper');

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

  _onMessage(message) {
    if (MessageHelper.isAddressedForBot(this, message)) {
      this._replyAnswer(message);
    }
  }

  _replyAnswer(originalMessage) {
    this.postMessage(originalMessage.user, 'ASDFK', { as_user: true });
  }
}

module.exports = CaniuseBot;
