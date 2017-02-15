const logger = require('winston');

class Message {
  constructor(props) {
    this.target = props.target;
    this.timeStamp = props.timeStamp;
    this.user = props.user;
    this.messageType = props.messageType;
    this.body = props.body;
  }
}

module.exports = Message;
