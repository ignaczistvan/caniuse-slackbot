const Message = require('../message');

function parseMessageType(slackMessage) {
  if (slackMessage.channel[0] === 'C') return 'Group';
  return 'Direct';
}
function extractBody(bot, message) {
  const re = new RegExp(`(${bot.settings.name})|(<@${bot.user.id}>)`, 'gi');
  return message.replace(re, '').trim();
}

module.exports = function slackMessageMapper(bot, slackMessage) {
  const props = {
    target: slackMessage.channel,
    timeStamp: slackMessage.ts,
    user: slackMessage.user,
    messageType: parseMessageType(slackMessage),
    body: extractBody(bot, slackMessage.text),
  };
  return new Message(props);
};
