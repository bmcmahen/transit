var toRegexp = require('path-to-regexp');

function Route(path){
  this.path = path;
  this.regexp = toRegexp(path, this.keys = []);
  this.in = [];
  this.out = [];
  this.params = [];
}

module.exports = Route;

Route.prototype.match = function(path){
  var params = this.params = [];
  var keys = this.keys;
  var qsIndex = path.indexOf('?');
  var pathname = ~qsIndex ? path.slice(0, qsIndex) : path;
  var m = this.regexp.exec(decodeURIComponent(pathname));

  if (!m) return false;

  for (var i = 1, len = m.length; i < len; i++){
    var key = keys[i - 1];
    var val = 'string' == typeof m[i]
      ? decodeURIComponent(m[i])
      : m[i];

    if (key) {
      params[key.name] = undefined !== params[key.name]
        ? params[key.name]
        : val;
    } else {
      params.push(val);
    }
    // pass in non-keyed params too. figure out the best way
    // to do this.
  }

  return true;
}