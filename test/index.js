describe('transit - pushState', function () {

  var transit = require('transit');
  var assert = require('assert');
  var noop = function(){};
  var trigger = require('trigger-event');
  var history = require('transit/lib/html5.js');
  var urlUtil = require('url');



  afterEach(function(){
    history.replace('/');
  });


  describe('#start', function(){

    transit.start();

    it('should bind to popstate', function(done){
      history.push('/popstate-one');
      history.push('/popstate-two');
      transit('/popstate-one', function(){
        done();
      });
      setTimeout(window.history.go(-1), 500);
    });

  });

  describe('#push', function(){
    it('should update our url', function(){
      transit.push('/push');
      var path = urlUtil.parse(window.location.href).pathname;
      assert(path === '/push');
    });
  });

  describe('#exec', function(){
    it('should not update our url', function(){
      transit.exec('/exec');
      var path = urlUtil.parse(window.location.href).pathname;
      assert(path !== '/exec');
    });

    it('should execute the associated middleware', function(done){
      transit('/exec', function(){ done(); });
      transit.exec('/exec');
    });
  })


  var middle1 = function(ctx, next){
    ctx.first = 'ben';
    next();
  };

  var middle2 = function(ctx, next){
    ctx.last = 'mcmahen';
    next();
  };

  /** DEFINE **/

  describe('#define', function(){
    transit.define('/define/:someone', [middle1, middle2]);
    var route = transit.routes[transit.routes.length - 1];

    transit.define('/select/*', [middle1]);
    var route2 = transit.routes[transit.routes.length - 1];

    it('should create a Route with path and fns', function(){
      assert(!!route);
      assert(route.path === '/define/:someone');
      assert(route.in.length == 2);
    });

    describe('Route', function(){
       it('should match certain paths', function(){
        assert(route.match('/define/yourself'));
      });

      it('should not match certain paths', function(){
        assert(!route.match('/define'));
        assert(!route.match('/define/bacon/asit'));
      });

      it('should get the correct params', function(done){
        transit.define('/ben/:lastname', [function(ctx){
          assert(ctx.params.lastname === 'mcmahen');
          done();
        }]);
        transit('/ben/mcmahen');
      });

      it('should match all selector', function(){
        assert(route2.match('/select/all'));
      });

    });
  });


  /** MIDDLEWARE **/

  describe('middleware', function(){

    it('should add middleware for routes & pass attr in ctx', function(done){
      transit('/middleware', middle1, middle2, function(ctx, next){
        assert(ctx.first === 'ben');
        assert(ctx.last === 'mcmahen');
        done();
      });
      transit.exec('/middleware');
    });

  });


  /** OUT **/

  describe('#out', function(){

    it('should call out middleware after leaving a route && pass context from in fns', function(done){
      transit('/out', middle1).out(middle2, function(ctx){
        assert(ctx.first === 'ben');
        assert(ctx.last === 'mcmahen');
        done();
      });
      transit('/in', noop);
      transit.go('/out');
      transit.go('/in');
    });

    // check entering route, leaving route, entering route.
  });

  /** CHECK **/

  describe('#listen', function(){
    it('should listen for clicks and intercept them', function(done){
      transit('/click', function(){ done(); });
      transit.listen();
      trigger(document.getElementById('link'), 'click');
    })
  });
  
});