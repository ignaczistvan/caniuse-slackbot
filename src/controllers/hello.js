const patterns = [
  {
    type: 'group',
    pattern: new RegExp('^hello caniuse', 'i'),
  },
  {
    type: 'direct',
    pattern: new RegExp('^hello', 'i'),
  },
];

function* generator(bot, req) {
  yield {
    target: req.target,
    user: req.user,
    body: `*Things I can help you with:*\n
  - "caniuse _feature_" for complete coverage\n
  - "caniuse _feature_ in _browser_ _version_" for browser specific support\n
You may leave the 'caniuse' part if you send me a private message. You can also mention me with an @`,
    params: {
      as_user: true,
    },
  };
}

module.exports = {
  generator,
  patterns,
};
