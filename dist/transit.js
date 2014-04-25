;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("component-query/index.js", function(exports, require, module){
function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
  return exports;
};

});
require.register("component-matches-selector/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var query = require('query');

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matches
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (vendor) return vendor.call(el, selector);
  var nodes = query.all(selector, el.parentNode);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}

});
require.register("discore-closest/index.js", function(exports, require, module){
var matches = require('matches-selector')

module.exports = function (element, selector, checkYoSelf, root) {
  element = checkYoSelf ? {parentNode: element} : element

  root = root || document

  // Make sure `element !== document` and `element != null`
  // otherwise we get an illegal invocation
  while ((element = element.parentNode) && element !== document) {
    if (matches(element, selector))
      return element
    // After `matches` on the edge case that
    // the selector matches the root
    // (when the root is not the document)
    if (element === root)
      return  
  }
}
});
require.register("component-event/index.js", function(exports, require, module){
var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  el[bind](prefix + type, fn, capture || false);

  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  el[unbind](prefix + type, fn, capture || false);

  return fn;
};
});
require.register("component-delegate/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var closest = require('closest')
  , event = require('event');

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, selector, type, fn, capture){
  return event.bind(el, type, function(e){
    var target = e.target || e.srcElement;
    e.delegateTarget = closest(target, selector, true, el);
    if (e.delegateTarget) fn.call(el, e);
  }, capture);
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  event.unbind(el, type, fn, capture);
};

});
require.register("component-link-delegate/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var delegate = require('delegate');
var url = require('url');

/**
 * Handle link delegation on `el` or the document,
 * and invoke `fn(e)` when clickable.
 *
 * @param {Element|Function} el or fn
 * @param {Function} [fn]
 * @api public
 */

module.exports = function(el, fn){
  // default to document
  if ('function' == typeof el) {
    fn = el;
    el = document;
  }

  delegate.bind(el, 'a', 'click', function(e){
    if (clickable(e)) fn(e);
  });
};

/**
 * Check if `e` is clickable.
 */

function clickable(e) {
  if (1 != which(e)) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey) return;
  if (e.defaultPrevented) return;

  // target
  var el = e.target;

  // check target
  if (el.target) return;

  // x-origin
  if (url.isCrossDomain(el.href)) return;

  return true;
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

});
require.register("component-path-to-regexp/index.js", function(exports, require, module){
/**
 * Expose `pathtoRegexp`.
 */

module.exports = pathtoRegexp;

/**
 * Normalize the given path string,
 * returning a regular expression.
 *
 * An empty array should be passed,
 * which will contain the placeholder
 * key names. For example "/user/:id" will
 * then contain ["id"].
 *
 * @param  {String|RegExp|Array} path
 * @param  {Array} keys
 * @param  {Object} options
 * @return {RegExp}
 * @api private
 */

function pathtoRegexp(path, keys, options) {
  options = options || {};
  var sensitive = options.sensitive;
  var strict = options.strict;
  keys = keys || [];

  if (path instanceof RegExp) return path;
  if (path instanceof Array) path = '(' + path.join('|') + ')';

  path = path
    .concat(strict ? '' : '/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, optional, star){
      keys.push({ name: key, optional: !! optional });
      slash = slash || '';
      return ''
        + (optional ? '' : slash)
        + '(?:'
        + (optional ? slash : '')
        + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
        + (optional || '')
        + (star ? '(/*)?' : '');
    })
    .replace(/([\/.])/g, '\\$1')
    .replace(/\*/g, '(.*)');

  return new RegExp('^' + path + '$', sensitive ? '' : 'i');
};

});
require.register("component-trim/index.js", function(exports, require, module){

exports = module.exports = trim;

function trim(str){
  if (str.trim) return str.trim();
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  if (str.trimLeft) return str.trimLeft();
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  if (str.trimRight) return str.trimRight();
  return str.replace(/\s*$/, '');
};

});
require.register("component-querystring/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var trim = require('trim');

/**
 * Parse the given query `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(str){
  if ('string' != typeof str) return {};

  str = trim(str);
  if ('' == str) return {};

  var obj = {};
  var pairs = str.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var parts = pairs[i].split('=');
    obj[parts[0]] = null == parts[1]
      ? ''
      : decodeURIComponent(parts[1]);
  }

  return obj;
};

/**
 * Stringify the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api public
 */

exports.stringify = function(obj){
  if (!obj) return '';
  var pairs = [];
  for (var key in obj) {
    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
  }
  return pairs.join('&');
};

});
require.register("component-url/index.js", function(exports, require, module){

/**
 * Parse the given `url`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(url){
  var a = document.createElement('a');
  a.href = url;
  return {
    href: a.href,
    host: a.host || location.host,
    port: ('0' === a.port || '' === a.port) ? port(a.protocol) : a.port,
    hash: a.hash,
    hostname: a.hostname || location.hostname,
    pathname: a.pathname.charAt(0) != '/' ? '/' + a.pathname : a.pathname,
    protocol: !a.protocol || ':' == a.protocol ? location.protocol : a.protocol,
    search: a.search,
    query: a.search.slice(1)
  };
};

/**
 * Check if `url` is absolute.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isAbsolute = function(url){
  return 0 == url.indexOf('//') || !!~url.indexOf('://');
};

/**
 * Check if `url` is relative.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isRelative = function(url){
  return !exports.isAbsolute(url);
};

/**
 * Check if `url` is cross domain.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isCrossDomain = function(url){
  url = exports.parse(url);
  return url.hostname !== location.hostname
    || url.port !== location.port
    || url.protocol !== location.protocol;
};

/**
 * Return default port for `protocol`.
 *
 * @param  {String} protocol
 * @return {String}
 * @api private
 */
function port (protocol){
  switch (protocol) {
    case 'http:':
      return 80;
    case 'https:':
      return 443;
    default:
      return location.port;
  }
}

});
require.register("yields-stop/index.js", function(exports, require, module){

/**
 * stop propagation on the given `e`.
 * 
 * examples:
 * 
 *      anchor.onclick = require('stop');
 *      anchor.onclick = function(e){
 *        if (!some) return require('stop')(e);
 *      };
 * 
 * 
 * @param {Event} e
 */

module.exports = function(e){
  e = e || window.event;
  return e.stopPropagation
    ? e.stopPropagation()
    : e.cancelBubble = true;
};

});
require.register("yields-prevent/index.js", function(exports, require, module){

/**
 * prevent default on the given `e`.
 * 
 * examples:
 * 
 *      anchor.onclick = prevent;
 *      anchor.onclick = function(e){
 *        if (something) return prevent(e);
 *      };
 * 
 * @param {Event} e
 */

module.exports = function(e){
  e = e || window.event
  return e.preventDefault
    ? e.preventDefault()
    : e.returnValue = false;
};

});
require.register("transit/index.js", function(exports, require, module){
module.exports = require('./lib');
});
require.register("transit/lib/index.js", function(exports, require, module){
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
});
require.register("transit/lib/html5.js", function(exports, require, module){
var hash = require('./hash');

/**
 * Looks up the current pathname.
 * @param {String} current path
 * @api private
 */

exports.get = function(){
  return window.location.pathname;
};


/**
 * pushState.
 * @param {String} url
 */

exports.push = function push(url){
  history.pushState(null, null, url);
};

/**
 * replaceState
 * @param {String} url
 */

exports.replace = function replace(url){
  history.replaceState(null, null, url);
};

/**
 * Listen Fn for when popstate changes
 * @param  {Function} fn 
 */

exports.listen = function listen(fn){
  window.addEventListener('load', function(){
    setTimeout(function() {
      window.addEventListener('popstate', fn, false);
    }, 0);
  });
};

/**
 * Unbind our Listen Fn
 * @param  {Function} fn
 */

exports.stop = function(fn){
  window.removeEventListener('popstate', fn, false);
};


/**
 * If we have a hash Url, but we are working with a
 * pushState enabled browser, then convert the hash to the
 * equivalent pushState. Used on startup.
 * @return {Boolean} 
 */

exports.convert = function(){
  if (window.location.hash){
    exports.replace(hash.get() + window.location.search);
  }
  return false;
};

});
require.register("transit/lib/hash.js", function(exports, require, module){
var convert = require('./conversion');

/**
 * Looks up the current pathname, normalizing
 * to standard URL. 
 * @return {String}
 */

exports.get = function(){
  return convert.hashToUrl(window.location.href);
};

/**
 * pushState
 * @param  {String} url 
 */

exports.push = function(url){
  url = convert.urlToHash(url);
  url = convert.removeSlash(url);
  window.location.hash = url;
};


/**
 * replaceState
 * @param  {String} url 
 */

exports.replace = function(url){
  var href = window.location.href.replace(/(javascript:|#).*$/, '');
  url = convert.urlToHash(url);
  window.location.replace(href + convert.removeSlash(url));
};

/**
 * Listen Fn for when our hash changes
 * Our hash-change API needs to be different, because it executes our
 * function any time that it changes... including when we set it!
 * See how backbone manages this.
 * @param  {Function} fn 
 */

exports.listen = function(fn){
  window.addEventListener('hashchange', fn, false);
};

/**
 * Unbind our Listen Fn
 * @param  {Function} fn 
 */

exports.stop = function(fn){
  window.removeEventListener('hashchange', fn, false);
};

/**
 * If we have a pushState URL but we are using hash instead,
 * then convert the pushState URL to the equivalent hashUrl.
 * @return {Boolean} isHash
 */

exports.convert = function(){
  if (window.location.hash) return true;
  var path = window.location.pathname;
  exports.replace(path);
  return true;
};
});
require.register("transit/lib/conversion.js", function(exports, require, module){
var firstSlash = /^\//;
var afterHash = /\#(?:!\/?)?(.*)/;
var firstHash = /\#(?:!\/?)?/;
var urlUtil = require('url');

/**
 * Convert a hash based URL to a pushState relative path
 * Eg. '/#bacon/ater' to '/bacon/ater'
 * Eg. '/#!bacon/ater' to '/bacon/ater'
 * Eg. '/#!/bacon/ater' to '/bacon/ater'
 * Eg. 'http://localhost:3000/#bacon/ater' -> '/bacon/ater'
 * @param {String} url
 */

exports.hashToUrl = function(url){
  var match = url.match(afterHash);
  if (!match) return '/';
  return '/' + (match[1] || '');
};

// this needs to be way more sophisticated
exports.isRoot = function(path){
  path = path.replace(firstHash, '');
  if (path === '/') return true;
};

/**
 * Convert a URL to hash-based URL
 * Eg. '/bacon/ater' -> '/#!/bacon/ater';
 * @param {String} url 
 */

exports.urlToHash = function(url){
   return '/' + url.replace(firstSlash, '#!/');
};


/**
 * Return the normalized route
 * @return {String} '/foo/bar'
 */

exports.normalizedRoute = function(){
  return window.location.hash
    ? exports.hashToUrl(window.location.href)
    : window.location.pathname;
};

/**
 * Remove the first slash of a string
 * Eg. '/#farmer/john' -> '#farmer/john'
 * @param  {String} url 
 * @return {String}     
 */

exports.removeSlash = function(url){
  return url.replace(firstSlash, '');
};

});
require.register("transit/lib/context.js", function(exports, require, module){
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
});
require.register("transit/lib/route.js", function(exports, require, module){
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
});
















require.alias("component-emitter/index.js", "transit/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");

require.alias("component-link-delegate/index.js", "transit/deps/link-delegate/index.js");
require.alias("component-link-delegate/index.js", "transit/deps/link-delegate/index.js");
require.alias("component-link-delegate/index.js", "link-delegate/index.js");
require.alias("component-delegate/index.js", "component-link-delegate/deps/delegate/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("component-matches-selector/index.js", "discore-closest/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("discore-closest/index.js", "discore-closest/index.js");
require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-url/index.js", "component-link-delegate/deps/url/index.js");

require.alias("component-link-delegate/index.js", "component-link-delegate/index.js");
require.alias("component-path-to-regexp/index.js", "transit/deps/path-to-regexp/index.js");
require.alias("component-path-to-regexp/index.js", "path-to-regexp/index.js");

require.alias("component-querystring/index.js", "transit/deps/querystring/index.js");
require.alias("component-querystring/index.js", "querystring/index.js");
require.alias("component-trim/index.js", "component-querystring/deps/trim/index.js");

require.alias("component-url/index.js", "transit/deps/url/index.js");
require.alias("component-url/index.js", "url/index.js");

require.alias("yields-stop/index.js", "transit/deps/stop/index.js");
require.alias("yields-stop/index.js", "stop/index.js");

require.alias("yields-prevent/index.js", "transit/deps/prevent/index.js");
require.alias("yields-prevent/index.js", "prevent/index.js");

require.alias("transit/index.js", "transit/index.js");if (typeof exports == "object") {
  module.exports = require("transit");
} else if (typeof define == "function" && define.amd) {
  define([], function(){ return require("transit"); });
} else {
  this["transit"] = require("transit");
}})();