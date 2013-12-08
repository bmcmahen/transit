var querystring = require('querystring');
var url = require('url');

module.exports = Context;

/**
 * Initialize a new `Context`.
 * Credit: https://github.com/ianstormtaylor/router/blob/master/lib/context.js
 * @param {String} path 
 */

function Context(path){
  this.path = path || '';
  this.params = [];
  this.url = url.parse(window.location.href);
  this.query = this.path.indexOf('?')
    ? querystring.parse(this.path.split('?')[1])
    : {};
}