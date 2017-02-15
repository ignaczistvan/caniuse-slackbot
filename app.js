'use strict';

var CaniuseBot = require('./src/caniusebot');

var token = '';
var name = 'caniusebot';

var caniuseBot = new CaniuseBot({
    token: token,
    name: name
});

caniuseBot.run();
