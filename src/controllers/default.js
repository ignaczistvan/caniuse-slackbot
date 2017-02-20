const caniuse = require('caniuse-api');
const supportView = require('../views/support');
const chooseView = require('../views/chooseFeature');

const patterns = [
  {
    type: 'group',
    pattern: new RegExp('^caniuse (.+)$', 'i'),
  },
  {
    type: 'direct',
    pattern: new RegExp('^caniuse (.+)$', 'i'),
  },
  {
    type: 'direct',
    pattern: new RegExp('^(.+)$', 'i'),
  },
];

function* generator(bot, req, pattern) {
  const featureString = req.body.match(pattern)[1];
  const feature = caniuse.find(`${featureString}`);
  if (Array.isArray(feature) && feature.length > 0) {
    let nextReq = yield {
      target: req.target,
      user: req.user,
      body: '',
      params: chooseView(featureString, feature),
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
  } else if (Array.isArray(feature)) {
    return {
      target: req.target,
      user: req.user,
      body: `Sorry, I can't understand. Try _"hello ${bot.user.name}"_ for usage!`,
      params: {
        as_user: true,
      },
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
  patterns,
};
