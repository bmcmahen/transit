
# Transit

  Yet another router. It's basically a combination of a myriad of other routers out there, but to my preference. In practice, it operates much like `visionmedia/page.js` except that it also has hash-based fallbacks, and `out` middleware that runs when a route is left. 

  You probably shouldn't use this yet since there aren't tests.


## Installation

  Install with [component(1)](http://component.io):

    $ component install bmcmahen/transit

## API

### #start

Begin listening for path changes

### #listen(root)

Listen for event clicks call the corresponding routes.

### #push(url)

Navigate to the specified URL.

### #exec(url)

Execute the url functions.

### #go(url)

Calls both `#push` and `#execute`. 


## Example

```javascript
var route = require('transit');
route.listen('/');

function myname(ctx, next){
  ctx.name = ctx.params.first || 'foo';
  next();
}

function lastname(ctx){
  var lastname = ctx.params.last || 'bar';
  console.log(ctx.name +' '+ lastname);
}

function age(){
  console.log('29');
}

route('/name', myname, lastname);
route('/name/:first', myname, lastname);
route('/name/:first/:last', myname, lastname);

route.start();
```

## TODO

- Improve middleware to handle errors, pass args, etc.
- TESTS

## License

  MIT
