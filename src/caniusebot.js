const Bot = require('slackbots');

class CaniuseBot extends Bot {
  /**
   * @constructor
   * @param {Object} settings - Basic settings of the bot
   * @param {string} settings.token - Slack access token
   * @param {Object} settings.logger - Winston logger instance
   * @param {string} [settings.name=caniusebot] - The displayed name of the bot
   * @param {Array} [settings.admins] - Array of the admins' user name
   */
  constructor(settings) {
    super(settings);
    // Settings
    this.settings = settings;
    this.logger = settings.logger;
    this.settings.admins = settings.admins || [];
    this.settings.name = this.settings.name || 'caniusebot';
    // Init
    this.controllers = [];
    this.conversations = new Map();
  }

  /**
   * Starts the bot with the added controllers added before
   */
  run() {
    this.on('start', this._startBot);
    this.on('message', this._handleMessage);
  }

  /**
   * Adds controller to the bottom of the controller stack with message pattern
   * @param {Object} controller
   * @param {Generator} controller.generator - The generator function that handles the messages
   * @param {string} controller.pattern - RegExp pattern.It's used to assign messages to controller
   */
  addController(controller) {
    this.controllers.push({
      generator: controller.generator,
      pattern: new RegExp(controller.pattern, 'gi'),
    });
  }

  /**
   *
   * @param {Object} res - The response object
   * @param {string} res.target - Target slack channel
   * @param {string} res.user - The recipient user's ID
   * @param {Object} iterator - Iterator object that handles the next message
   * @private
   */
  _addConversation(res, iterator) {
    const id = Symbol('id');
    this.conversations.set(
      JSON.stringify({ target: res.target, user: res.user }),
      { id, iterator });

    // Delete the conversation after 60 secs
    this._expireConversation(JSON.stringify({ target: res.target, user: res.user }), id, 60000);
  }

  /**
   *
   * @param {string} key - Target + User = Key of the conversation
   * @param {Symbol} id - Unique symbol of the conversation
   * @param {number} ttl - Expiration time of the conversation is ms
   * @private
   */
  _expireConversation(key, id, ttl) {
    setTimeout(() => {
      if (this.conversations.get(key).id === id) this.conversations.delete(key);
    }, ttl);
  }

  /**
   * This function runs after when the bot is initialized
   *  - Sets the Slack user object to the user property
   *  - Sends message to the admins
   * @private
   */
  _startBot() {
    this.user = this.users.filter(user => user.name === this.name)[0];
    this.settings.admins.forEach(admin => this.postMessageToUser(admin, 'Elindult a bot.', { as_user: true }));
    this.logger.info('Elindultunk.');
  }

  /**
   * Handles the incoming message
   * @param {Object} slackMessage - Message object from slack
   * @private
   */
  _handleMessage(slackMessage) {
    // If its obviously not for us, dont do nothing
    if (slackMessage.bot_id === this.user.id) return;
    if (slackMessage.type !== 'message' || slackMessage.subtype !== undefined) return;
    this.logger.debug('Új üzenet:', slackMessage);

    const req = mapSlackMessage(slackMessage); // Parse the incoming request
    const controller = this._routeRequest(req); // Find the right controller for the request
    // If there's no matching controller just go on - router takes care of error handling
    if (!controller) return;
    const res = controller.next(req);
    if (!res.done) this._addConversation(res.value, controller);
    this._reply(res.value); // reply the "rendered" message back to the user
  }

  /**
   * Routes the incoming request object to the controller/conversation
   * @param {Object} req
   * @param {string} req.target
   * @param {string} req.timeStamp
   * @param {string} req.user
   * @param {string} req.messageType
   * @param {string} req.body
   * @private
   */
  _routeRequest(req) {
    const conversation = this.conversations.get(JSON.stringify({
      target: req.target,
      user: req.user,
    }));
    if (conversation) {
      return conversation.iterator;
    }
    const newConversation = this.controllers.find(controller => req.body.match(controller.pattern));
    if (newConversation) {
      return newConversation.generator(this, req);
    }
    return undefined;
  }

  /**
   * Sends message to Slack
   * @param {Object} res - The response object
   * @param {string} res.target - Target slack channel
   * @param {string} res.user - The recipient user's ID
   * @param {string} res.body - The text of the message
   * @private
   */
  _reply(res) {
    this.postMessage(res.target, res.body, res.params);
  }
}

/**
 *
 * @param slackMessage
 * @returns {{target: string, timeStamp: string,user: string, messageType: string, body: string}}
 */
function mapSlackMessage(slackMessage) {
  // const re = new RegExp(`(${bot.settings.name})|(<@${bot.user.id}>)`, 'gi');
  return {
    target: slackMessage.channel,
    timeStamp: slackMessage.ts,
    user: slackMessage.user,
    messageType: slackMessage.channel[0] === 'C' ? 'Group' : 'Direct',
    body: slackMessage.text,
  };
}

module.exports = CaniuseBot;
