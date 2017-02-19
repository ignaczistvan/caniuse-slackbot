const caniuse = require('caniuse-api');
const supportView = require('../views/support');
const chooseView = require('../views/chooseFeature');

const pattern = new RegExp('^caniuse (.+)$', 'i');

function* generator(bot, req) {
  const feature = req.body.match(pattern)[1];
  if (Array.isArray(caniuse.find(feature))) {
    let nextReq = yield {
      target: req.target,
      user: req.user,
      body: '',
      params: chooseView(feature, caniuse.find(feature)),
    };
    while (Array.isArray(caniuse.find(nextReq.body)) || caniuse.find(nextReq.body) === undefined) {
      nextReq = yield {
        target: nextReq.target,
        user: nextReq.user,
        body: `Sorry, I can't understand _'${nextReq.body}'_`,
        params: {
          as_user: true,
        },
      };
    }
    bot.conversations.delete(JSON.stringify({ target: nextReq.target, user: nextReq.user }));
    return {
      target: nextReq.target,
      user: req.user,
      body: '',
      params: supportView(nextReq.body, 'warning', caniuse.getSupport(nextReq.body)),
    };
  }
  return {
    target: req.target,
    user: req.user,
    body: '',
    params: supportView(feature, 'warning', caniuse.getSupport(feature)),
  };
}

module.exports = {
  generator,
  pattern,
};
