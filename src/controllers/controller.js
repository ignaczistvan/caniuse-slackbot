const caniuse = require('caniuse-api');

const pattern = new RegExp('^caniuse (.+)$', 'i');

function* generator(bot, req) {
  const feature = req.body.match(pattern)[1];
  if (Array.isArray(caniuse.find(feature))) {
    const nextReq = yield {
      target: req.target,
      user: req.user,
      body: `B variáns: ${caniuse.find(feature)}`,
      params: {},
    };
    bot.logger.debug('ide is beléptem!');
    return {
      target: nextReq.target,
      user: req.user,
      body: 'hello-szia-szevasz',
      params: {},
    };
  }
  return {
    target: req.target,
    user: req.user,
    body: `A variáns: ${caniuse.getSupport(feature)}`,
    params: {},
  };
}

module.exports = {
  generator,
  pattern,
};
