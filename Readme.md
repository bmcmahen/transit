
# Transit

  Yet another router. It's basically a combination of a myriad of other routers out there, but to my preference. In practice, it operates much like `visionmedia/page.js` except that it also has hash-based fallbacks, and `out` middleware that runs when a route is left. 

  You probably shouldn't use this yet since there aren't tests.

## Installation

  Install with [component(1)](http://component.io):

    $ component install bmcmahen/transit

## API

```javascript
var transit = require('transit');

function getUser(ctx, next){
  ctx.user = 'ben';
  next();
}

function renderBacon(ctx, next){
  $('body').text(ctx.user + ' likes bacon');
}

function closeBacon(ctx){
  $('body').empty();
}

transit('/bacon', getUser, renderBacon).out(closeBacon);
transit('/saymyname', function(ctx){
  console.log('say my name!');
});

// Use link delegation to trigger routes.
transit.listen('/');

// Start listening for routes
transit.start();
```

## TODO

- Improve middleware to handle errors, pass args, etc.
- TESTS

## License

  MIT
