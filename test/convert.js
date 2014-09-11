describe('Conversion.js', function () {

  var assert = require('component/assert');
  var noop = function(){};
  var convert = require('../lib/conversion.js');
  var urlUtil = require('component/url');


  describe('#hashToUrl', function(){
    it('should convert hash to regular relative path', function(){
      assert(convert.hashToUrl('#!/bacon') == '/bacon');
      assert(convert.hashToUrl('/#!bacon') == '/bacon');
      assert(convert.hashToUrl('http://bacon.com/#!/bacon') == '/bacon');
      assert(convert.hashToUrl('#!/') == '/');
      assert(convert.hashToUrl('http://bacon.com') == '/');
    });
    it('should not strip subsequent hashes', function(){
      assert(convert.hashToUrl('#!/bacon/#ater') == '/bacon/#ater');
    });
  });

  describe('#urlToHash', function(){
    it('should take a regular url and return hash', function(){
      assert(convert.urlToHash('/bacon/ater') === '/#!/bacon/ater');
      assert(convert.urlToHash('/') === '/#!/');
    });
  });


  describe('#removeSlash', function(){
    it('should remove the first slash from a path', function(){
      assert(convert.removeSlash('/bacon/ater') === 'bacon/ater');
    });
  });




});
