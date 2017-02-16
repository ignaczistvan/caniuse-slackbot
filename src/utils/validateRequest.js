// Todo: Refact the whole thing.
function isGroupConversation(message) {
  return typeof message.channel === 'string' && message.channel[0] === 'C';
}

function isMentioningBot(bot, message) {
  return message.text.toLowerCase().indexOf(bot.name) > -1;
}

function isInConversation(bot, message) {
  return bot.conversations.has({
    user: message.user,
    target: message.target,
  });
}

module.exports = {
  isGroupConversation,
  isFromCaniuseBot,
  isMentioningBot,
  isInConversation,
};
