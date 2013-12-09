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