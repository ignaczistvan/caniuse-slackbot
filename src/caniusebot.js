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
    this.on('start', () => {
      this.user = this.users.filter(user => user.name === this.name)[0];
      this.settings.admins.forEach((admin) => {
        this.postMessageToUser(admin, 'Elindult a bot.', { as_user: true });
      });
      this.logger.info('Elindult a bot.');
    });
    this.on('close', () => {
      this.settings.admins.forEach((admin) => {
        this.postMessageToUser(admin, 'Leállt a bot.', { as_user: true });
      });
      this.logger.info('Leállt a bot');
    });
    this.on('error', e => this.logger.error('Hiba történt a Slack kapcsolódás közben', e));

    this.on('message', this._handleMessage);
  }

  /**
   * Adds controller to the bottom of the controller stack with message pattern
   * @param {Object} controller
   * @param {Generator} controller.generator - The generator function that handles the messages
   * @param {string} controller.pattern - RegExp pattern.It's used to assign messages to controller
   */
  addController(controller) {
    controller.patterns.forEach((pattern) => {
      this.controllers.push({
        generator: controller.generator,
        pattern: pattern.pattern,
        type: pattern.type,
      });
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
      if (this.conversations.get(key) && this.conversations.get(key).id === id) this.conversations.delete(key);
    }, ttl);
  }

 /**
 *
 * @param slackMessage
 * @returns {{target: string, timeStamp: string,user: string, messageType: string, body: string}}
 */
  _mapSlackMessage(slackMessage) {
    const re = new RegExp(`<@${this.user.id}>`, 'gi');
    return {
      target: slackMessage.channel,
      timeStamp: slackMessage.ts,
      user: slackMessage.user,
      messageType: slackMessage.channel[0] === 'C' ? 'group' : 'direct',
      body: slackMessage.text.replace(re, this.settings.name),
    };
  }

  /**
   * Handles the incoming message
   * @param {Object} slackMessage - Message object from slack
   * @private
   */
  _handleMessage(slackMessage) {
    // If its obviously not for us, dont do nothing
    if (slackMessage.user === this.user.id) return;
    if (slackMessage.type !== 'message' || slackMessage.subtype !== undefined) return;
    this.logger.debug('Új üzenet:', slackMessage);

    const req = this._mapSlackMessage(slackMessage); // Parse the incoming request
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
    /* eslint arrow-body-style: 0 */
    const newConversation = this.controllers.find((controller) => {
      return req.body.match(controller.pattern) && req.messageType === controller.type;
    });
    if (newConversation) {
      return newConversation.generator(this, req, newConversation.pattern);
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

module.exports = CaniuseBot;
