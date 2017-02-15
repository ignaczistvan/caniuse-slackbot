'use strict';

var util = require('util');
var path = require('path');
var Bot = require('slackbots');

class CaniuseBot extends Bot {
  constructor(settings) {
    super(settings);

    this.settings = settings;
    this.settings.name = this.settings.name || 'caniusebot';
  }

run() {
    this.on('start', this._onStart);
    this.on('message', this._onMessage);
};

_onStart() {
    this._loadBotUser();
};

_loadBotUser() {
    var self = this;
    this.user = this.users.filter(function (user) {
        return user.name === self.name;
    })[0];
};

_onMessage(message) {


    if (this._isChatMessage(message)
        //this._isChannelConversation(message) &&
        //!this._isFromCaniuseBot(message) &&
        //this._isMentioningCaniuseBot(message)
    ) {
      console.log('ide');
        this._replyAnswer(message);
    }
}

  _isChatMessage(message) {
      return message.type === 'message' && Boolean(message.text);
  }

  _isChannelConversation(message) {
      return typeof message.channel === 'string' &&
          message.channel[0] === 'D';
  }

  _isFromCaniuseBot(message) {
    console.log(this.user);
      return message.user === this.user.id;
  }

  _isMentioningCaniuseBot(message) {
      return message.text.toLowerCase().indexOf('caniusebot') > -1 ||
          message.text.toLowerCase().indexOf(this.name) > -1;
  }

  _replyAnswer(originalMessage) {
    this.postMessage(originalMessage.user, 'ASDF', {as_user: true});
  }

  _getChannelById(channelId) {
      return this.channels.filter(function (item) {
          return item.id === channelId;
      })[0];
  }
};

module.exports = CaniuseBot;
