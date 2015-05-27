// https://github.com/jesstelford/react-testing-mocha-jsdom/blob/master/test/setup.js
var jsdom = require('jsdom').jsdom;

global.document = jsdom('<html><body></body></html>');
global.window = global.document.defaultView;
