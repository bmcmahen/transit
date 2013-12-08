var firstSlash = /^\//g;

/**
 * Convert a hash based URL to a pushState relative path
 * Eg. '/#bacon/ater' to '/bacon/ater'
 * Eg. 'http://localhost:3000/#bacon/ater' -> '/bacon/ater'
 * @param {String} url
 */

exports.hashToUrl = function(url){
  var match = url.split('#');
  return '/' + (match[1] || '');
};



/**
 * Convert a URL to hash-based URL
 * Eg. '/bacon/ater' -> '/#bacon/ater';
 * @param {String} url 
 */

exports.urlToHash = function(url){
  return '/#' + exports.removeSlash(url);
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