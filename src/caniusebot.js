const logger = require('winston'); // TODO: Handle loglevel
// const caniuse = require('caniuse-api');
const Bot = require('slackbots');
const Controller = require('./controller');
const { slackMessageMapper } = require('./utils');

class CaniuseBot extends Bot {
  constructor(settings) {
    super(settings);

    this.settings = settings;
    this.settings.name = this.settings.name || 'caniusebot';
    this.controllers = [];
    this.conversations = new Map();
    this.controller = new Controller(this.conversations);
  }

  run() {
    this.on('start', this._startBot);
    this.on('message', this._handleMessage);
  }

  addController(pattern, callback) {
    this.controllers.push({
      callback,
      pattern: RegExp(pattern, 'gi'),
    });
  }

  _startBot() {
    this.user = this.users.filter(user => user.name === this.name)[0];
    this.postMessageToUser('ignacz.istvan', 'Elindult a bot.');
    logger.info('Elindultunk.');
  }

  _handleMessage(slackMessage) {
    // If its obviosly not for us, dont do nothing
    if (slackMessage.user === this.user.id) return;
    if (slackMessage.type === 'message'
      && slackMessage.subtype === undefined
      && Boolean(slackMessage.text)) return;
    logger.info(`Új üzenet: ${slackMessage.text}`);
    const req = slackMessageMapper(this, slackMessage); // Parse the incoming request
    const controller = this._routeRequest(req); // Find the right controller for the request
    // If there's no matching controller just go on - router takes care of error handling
    if (!controller) return;
    const res = controller(req);
    this._reply(res); // reply the "rendered" message back to the user
  }

  _routeRequest(req) {
    // ToDo:
    //  - Találjuk meg, aki kezelni fogja:
    //    - Conversation callback
    //    - Regexp alapján controller
    //    - Default controller
    //  - Ha megvan a controller, akkor mielőtt ráküldjük, dobjunk type-ot
    return req;
  }

  _reply(res) {
    this.postMessage(res.target, res.body, res.params);
  }
}

module.exports = CaniuseBot;
