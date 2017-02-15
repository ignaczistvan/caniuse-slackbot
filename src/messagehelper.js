const logger = require('winston');

class MessageHelper {
  static isAddressedForBot(slack, message) {
    if (!MessageHelper._isChatMessage(message)) return false;
    if (MessageHelper._isFromCaniuseBot(slack, message)) return false;
    if (MessageHelper._isGroupConversation(message)
      && !MessageHelper._isMentioningBot(slack, message)) return false;
    return true;
  }

  static _isChatMessage(message) {
    return message.type === 'message' && message.subtype === undefined && Boolean(message.text);
  }

  static _isGroupConversation(message) {
    return typeof message.channel === 'string' && message.channel[0] === 'C';
  }

  static _isFromCaniuseBot(slack, message) {
    return message.user === slack.user.id;
  }

  static _isMentioningBot(slack, message) {
    return message.text.toLowerCase().indexOf(slack.name) > -1;
  }
}

module.exports = MessageHelper;
