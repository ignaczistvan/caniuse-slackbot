class Controller {
  constructor(conversations) {
    this.conversations = conversations;
  }
  onMessage(message) {
    return {
      target: message.target,
      body: message.body,
      conversation: this.conversations.get(message.user.id),
    };
  }
}

module.exports = Controller;
