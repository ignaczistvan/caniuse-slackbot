const Bot = require('slackbots');
const { slackMessageMapper } = require('./utils');

class CaniuseBot extends Bot {
  constructor(settings) {
    super(settings);

    this.settings = settings;
    this.logger = settings.logger;
    this.settings.name = this.settings.name || 'caniusebot';
    this.controllers = [];
    this.conversations = new Map();
  }

  run() {
    this.on('start', this._startBot);
    this.on('message', this._handleMessage);
  }

  // TODO:
  //  - Allow multiple patterns in array (?)
  addController(controller) {
    this.controllers.push({
      generator: controller.generator,
      pattern: new RegExp(controller.pattern, 'gi'),
    });
  }

  _addConversation(res, iterator) {
    const id = Symbol('id');
    this.conversations.set(
      JSON.stringify({ target: res.target, user: res.user }),
      { id, iterator });

    // Delete the conversation after 60 secs
    this._expireConversation(JSON.stringify({ target: res.target, user: res.user }), id, 60000);
  }

  _expireConversation(key, id, ttl) {
    setTimeout(() => {
      if (this.conversations.get(key).id === id) this.conversations.delete(key);
    }, ttl);
  }

  _startBot() {
    this.user = this.users.filter(user => user.name === this.name)[0];
    this.postMessageToUser('ignacz.istvan', 'Elindult a bot.', { as_user: true });
    this.logger.info('Elindultunk.');
  }

  _handleMessage(slackMessage) {
    // If its obviously not for us, dont do nothing
    if (slackMessage.bot_id === this.user.id) return;
    if (slackMessage.type !== 'message' || slackMessage.subtype !== undefined) return;
    this.logger.debug('Új üzenet:', slackMessage);

    const req = slackMessageMapper(this, slackMessage); // Parse the incoming request
    const controller = this._routeRequest(req); // Find the right controller for the request
    // If there's no matching controller just go on - router takes care of error handling
    if (!controller) return;
    const res = controller.next(req);
    if (!res.done) this._addConversation(res.value, controller);
    this._reply(res.value); // reply the "rendered" message back to the user
  }

  _routeRequest(req) {
    const conversation = this.conversations.get(
      JSON.stringify({ target: req.target, user: req.user })
    );
    if (conversation) {
      return conversation.iterator;
    }
    const newConversation = this.controllers.find(controller => req.body.match(controller.pattern));
    if (newConversation) {
      return newConversation.generator(this, req);
    }
    return undefined;
  }

  _reply(res) {
    this.postMessage(res.target, res.body, res.params);
  }
}

module.exports = CaniuseBot;
