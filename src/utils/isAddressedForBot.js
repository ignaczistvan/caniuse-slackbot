function isChatMessage(message) {
  return message.type === 'message' && message.subtype === undefined && Boolean(message.text);
}

function isGroupConversation(message) {
  return typeof message.channel === 'string' && message.channel[0] === 'C';
}

function isFromCaniuseBot(bot, message) {
  return message.user === bot.user.id;
}

function isMentioningBot(bot, message) {
  return message.text.toLowerCase().indexOf(bot.name) > -1;
}

module.exports = function isAddressedForBot(bot, message) {
  if (!isChatMessage(message)) return false;
  if (isFromCaniuseBot(bot, message)) return false;
  if (isGroupConversation(message)
    && !isMentioningBot(bot, message)) return false;
  return true;
};
