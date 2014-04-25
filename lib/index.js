// Dependencies
var toRegexp = require('path-to-regexp');
var Emitter = require('emitter');
var link = require('link-delegate');
var prevent = require('prevent');
var stop = require('stop');
var urlUtil = require('url');

// Locals
var Context = require('./context');
var convert = require('./conversion');
var Route = require('./route');


module.exports = transit;


/**
 * transit
 * @param  {String}   url 
 * @param  {Function} fn  
 * @return {transit}       
 */

function transit(url, fn){
  if (!url) throw new TypeError('url required');

  // definition of a new route with given functions
  if ('function' == typeof fn) {
    var fns = Array.prototype.slice.call(arguments);
    fns.shift();
    transit.define(url, fns);
    return transit;
  }

  // otherwise goes to a route
  transit.go(url);
  return transit;
}


Emitter(transit);

transit.routes = [];

transit.running = false;

transit.previous = null;

transit.context = function(path){
  var previous = transit._context || {};
  var context = transit._context = new Context(path);
  context.previous = previous;
  return context;
}

/**
 * Goes to a route.
 * Equivalent to `push` + `exec`.
 *
 * @param {String} url
 * @api public
 */

transit.go = function go(url){
  transit.push(url);
  transit.exec(url);
};


/**
 * Defines a route.
 *
 * @param {String} url
 * @param {Function} callback
 * @api public
 */

transit.define = function define(url, fns){
  var route = new Route(url);
  route.in = fns;
  transit.currentHandler = route;
  transit.routes.push(route);
};


/**
 * Define handlers for when we leave a route.
 */

transit.out = function out(){
  var fns = Array.prototype.slice.call(arguments);
  if (!transit.currentHandler) return;
  transit.currentHandler.out = fns;
};


/**
 * Starts the router and invokes the
 * current url. 
 */

transit.start = function start(){
  if (transit.running) return;
  transit.running = true;
  transit.api.listen(transit.check);
  transit.invoke();
}

/**
 * Checks to see if the route is the same as our current
 * route. Used primarily to filter hashchange events
 * so that they dont fire on a push.
 */

transit.check = function check(){
  var current = transit.api.get();
  if (current === transit.fragment) return false;
  transit.invoke();
}

/**
 *
 * Invokes the router.
 *
 * @api public
 */

transit.invoke = function invoke(){
  transit.fragment = transit.api.get();
  transit.exec(transit.fragment);
};




/**
 * Executes a route.
 *
 * @param {String} url
 * @api public
 */


transit.exec = function exec(url){  
  var matched = transit.lookup(url);


  if (transit.previous) {
    transit.previous.forEach(function(route){
      if (route.out && route.out.length && !route.match(url)) {
        transit._context._currentPath = url;
        middleware(transit._context, route.out);
      }
    });
  }
  
  transit.emit('change', url);

  if (!matched.length) return;
  var ctx = transit.context(url);

  // iterate through all of our matched routes
  matched.forEach(function(match){
    ctx.params = match.params;
    middleware(ctx, match.in);
  });

  transit.previous = matched;
  transit.url = url;
  transit.emit('exec', url);
};

/**
 * Looks up a handler for the given `url`.
 *
 * @param {String} url
 * @return {Number} route index
 * @api private
 */

transit.lookup = function lookup(url){
  var routes = transit.routes;
  var matched = [];
  for (var i = 0, len = routes.length; i < len; i++){
    if (routes[i].match(url)) matched.push(routes[i]);
  }
  return matched;
}

/**
 * Push state.
 */

transit.push = function push(url){
  if (url == transit.api.get()) return;
  transit.fragment = url;
  transit.api.push(url);
  transit.emit('push', url);
};

/**
 * Replace state.
 */

transit.replace = function replace(url){
  transit.api.replace(url);
  transit.emit('replace', url);
};

/**
 * Listen for link clicks to a specified path,
 * and trigger router events. 
 * Credits: https://github.com/ianstormtaylor/router
 * @param  {String} path 
 */

transit.listen = function listen(path){
  link(function(e){
    var el = e.delegateTarget || e.target;
    var href = el.href;
    if (!el.hasAttribute('href') 
      || !routable(href, path)
      || !transit.lookup(urlUtil.parse(href).pathname)) return;
    var parsed = urlUtil.parse(href);
    transit.go(parsed.pathname);
    prevent(e);
    stop(e);
  });
};

/**
 * Ultra simple middleware
 * @param  {Context} ctx 
 * @param  {Array} fns 
 */

function middleware(ctx, fns){
  var i = 0;
  function next(){
    var fn = fns[i++];
    if (!fn) return;
    fn(ctx, next);
  }
  next();
}

/**
 * Check if a given 'href' is routable under 'path'.
 * Credits: https://github.com/ianstormtaylor/router
 * @param  {String} href 
 * @param  {String} path 
 * @return {Boolean}  
 */

function routable(href, path){
  if (!path) return true;
  var parsed = urlUtil.parse(href);
  if (parsed.pathname.indexOf(path) === 0) return true;
  return false;
}

/**
 * History Adapter (defaults to HTML5, with fallback to 
 * Hash). IE < 8 is not supported.
 *
 * @api private
 */

var hasPushState = !!(window.history && window.history.pushState && window.location.protocol !== 'file:');
transit.api = hasPushState ? require('./html5') : require('./hash');