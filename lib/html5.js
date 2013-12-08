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
  window.addEventListener('popstate', fn, false);
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
