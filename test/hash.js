describe('Hash.js', function () {

  var assert = require('assert');
  var noop = function(){};
  var hash = require('transit/lib/hash.js');
  var urlUtil = require('url');

  afterEach(function(){
    hash.replace('/');
  });

  describe('#push', function(){

    it('should take a standard url and translate it to a hash', function(){
      hash.push('/bacon');
      assert(window.location.hash === '#bacon');
      hash.push('/bacon/#something');
      assert(window.location.hash === '#bacon/#something');
      hash.push('/bacon/more');
      assert(window.location.hash === '#bacon/more');
      hash.push('/');
      assert(!window.location.hash);
    });
  });

  describe('#replace', function(){
    it('should replace the current url', function(){
      hash.replace('/superman');
      assert(window.location.hash === '#superman');
      hash.replace('/superman/#says');
      assert(window.location.hash === '#superman/#says');
      hash.replace('/');
      var parsed = urlUtil.parse(window.location.href);
      assert(!parsed.hash);
    });
  });

  describe('#get', function(){
    it('should get a normalized url from hash', function(){
      hash.replace('/superman');
      assert(hash.get() == '/superman');
      hash.replace('/');
      assert(hash.get() == '/');
    });
  });


  describe('#convert', function(){
    it('should convert a pushState url to hash', function(){
      hash.replace('/bacon');
      hash.convert();
      assert(window.location.hash === '#bacon');
    });
  });

 
  
});