/**
 * Dependencies
 */

var Emitter = require('emitter');
var delegate = require('delegate');

/**
 * Local Dependencies
 */

var Context = require('./context');
var Route = require('./route');

/**
 * Expose transit
 */

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
};

/**
 * Goes to a route.
 * Equivalent to `push` + `exec`.
 *
 * @param {String} url
 * @api public
 */

transit.go = function(url){
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

transit.define = function(url, fns){
  var route = new Route(url);
  route.in = fns;
  transit.currentHandler = route;
  transit.routes.push(route);
};

/**
 * Define handlers for when we leave a route.
 */

transit.out = function(){
  var fns = Array.prototype.slice.call(arguments);
  if (!transit.currentHandler) return;
  transit.currentHandler.out = fns;
};

/**
 * Starts the router and invokes the
 * current url.
 */

transit.start = function(){
  if (transit.running) return;
  transit.running = true;
  transit.api.listen(transit.check);
  transit.invoke();
};

/**
 * Checks to see if the route is the same as our current
 * route. Used primarily to filter hashchange events
 * so that they dont fire on a push.
 */

transit.check = function(){
  var current = transit.api.get();
  if (current === transit.fragment) return false;
  transit.invoke();
};

/**
 *
 * Invokes the router.
 *
 * @api public
 */

transit.invoke = function(){
  transit.fragment = transit.api.get();
  transit.exec(transit.fragment);
};

/**
 * Executes a route.
 *
 * @param {String} url
 * @api public
 */

transit.exec = function(url){
  var matched = transit.lookup(url);
  var route, i;

  // iterate through all non-matching 'out' middleware fns
  if (transit.previous) {
    for (i = 0; i < transit.previous.length; i++) {
      route = transit.previous[i];
      if (route.out && route.out.length && !route.match(url)) {
        transit._context._currentPath = url;
        middleware(transit._context, route.out);
      }
    }
  }

  transit.emit('change', url);

  if (!matched.length) return;
  var ctx = transit.context(url);

  // iterate through all of our matched route middleware fns
  for (i = 0; i < matched.length; i++) {
    route = matched[i];
    ctx.params = route.params;
    middleware(ctx, route.in);
  }

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

transit.lookup = function(url){
  var routes = transit.routes;
  var matched = [];
  for (var i = 0, len = routes.length; i < len; i++){
    if (routes[i].match(url)) matched.push(routes[i]);
  }
  return matched;
};

/**
 * Push state.
 */

transit.push = function(url){
  if (url == transit.api.get()) return;
  transit.fragment = url;
  transit.api.push(url);
  transit.emit('push', url);
};

/**
 * Replace state.
 */

transit.replace = function(url){
  transit.api.replace(url);
  transit.emit('replace', url);
};

/**
 * Listen for click events
 * @return {transit}
 */

transit.listen = function(){
  delegate.bind(document, 'a', 'click', onclick);
  return this;
};

/**
 * onclick listener
 * @param  {Event} e
 */

function onclick(e) {
  if (1 != which(e)) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey) return;
  if (e.defaultPrevented) return;

  var el = e.delegateTarget || e.target;
  var link = el.getAttribute('href');
  if (el.pathname == location.pathname && (el.hash || '#' == link)) return;
  if (link && ~link.indexOf('mailto:')) return;
  if (!sameOrigin(el.href)) return;
  var path = el.pathname + el.search + (el.hash || '');
  var orig = path + el.hash;
  if (!transit.lookup(path)) return;
  e.preventDefault();
  transit.go(orig);
}



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
 * Event button.
 */

function which(e) {
  e = e || window.event;
  return null == e.which
    ? e.button
    : e.which;
}

/**
 * Check if `href` is the same origin.
 */

function sameOrigin(href) {
  var origin = location.protocol + '//' + location.hostname;
  if (location.port) origin += ':' + location.port;
  return (href && (0 == href.indexOf(origin)));
}

/**
 * History Adapter (defaults to HTML5, with fallback to
 * Hash). IE < 8 is not supported.
 *
 * @api private
 */

var hasPushState = !!(window.history
  && window.history.pushState
  && window.location.protocol !== 'file:');
transit.api = hasPushState ? require('./html5') : require('./hash');
