const logger = require('winston'); // TODO: Handle loglevel
const Bot = require('slackbots');

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
  }

  _loadBotUser() {
    this.user = this.users.filter(user => user.name === this.name)[0];
  }

  _onMessage(message) {
    if (CaniuseBot._isChatMessage(message) &&
      CaniuseBot._isChannelConversation(message) &&
      !this._isFromCaniuseBot(message) &&
      this._isMentioningCaniuseBot(message)
    ) {
      this._replyAnswer(message);
    }
  }

  static _isChatMessage(message) {
    return message.type === 'message' && Boolean(message.text);
  }

  static _isChannelConversation(message) {
    return typeof message.channel === 'string' &&
        message.channel[0] === 'D';
  }

  _isFromCaniuseBot(message) {
    return message.user === this.user.id;
  }

  _isMentioningCaniuseBot(message) {
    return message.text.toLowerCase().indexOf('caniusebot') > -1 ||
        message.text.toLowerCase().indexOf(this.name) > -1;
  }

  _replyAnswer(originalMessage) {
    logger.info('MI?');
    this.postMessage(originalMessage.user, 'ASDFK', { as_user: true });
  }
}

module.exports = CaniuseBot;
