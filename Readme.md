
# Transit

  Transit is a simple router, inspired by `page.js`, but made to my preference. It also has hash-based fallbacks because most of us still need to support IE 9.


## Installation

  Install with [component(1)](http://component.io)

    $ component install bmcmahen/transit

  Or [Duo](http://github.com/duojs/duo)

  ```javascript
  var transit = require('bmcmahen/transit');
  ```

## API

### transit.start()

Begin listening for URL changes. Typically you will call this after specifying all of your routes.

### transit.listen()

Active click delegation. If the path is specified in your router it will push and execute the URL and its functions.

```javascript
transit.listen();
transit('/bacon', getBacon);
```

```html
<a href='/bacon'>Get Bacon</a>
```

When Get Bacon is clicked, the getBacon function will run.

### transit.push(url)

Update the URL and add it to the history without executing the specified callbacks.

```javascript
transit.push('/bacon');
```

### transit.exec(url)

Execute the specified callbacks for the provided URL without manipulating the URL or adding it to the history.

```javascript
transit.exec('/bacon');
```

### transit.go(url)

Call both `#push` and `#exec` for the specified url.

```javascript
transit.go('/bacon');
```

Alternative, use the shorthand:

```javascript
transit('/bacon');
```


## Example

```javascript
var route = require('transit');

function allRoutes(ctx, next){
  console.log('I run on all routes');
  ctx.bacon = 'tasty';
  next();
}

function myname(ctx, next){
  ctx.name = ctx.params.first || 'foo';
  console.log('bacon is', ctx.bacon || 'not tasty');
  next();
}

function lastname(ctx, next){
  var lastname = ctx.params.last || 'bar';
  console.log(ctx.name +' '+ lastname);
}

function after(ctx, next){
  console.log('I run when the route is left');
}

route('*', allRoutes);
route('/name', myname, lastname);
route('/name/:first', myname, lastname);
route('/name/:first/:last', myname, lastname).out(after);

route.listen('/');
route.start();
```

## TODO

- Improve middleware to handle errors, pass args, etc.
- more tests

## Running Tests

    $ npm install component-test -g
    $ component build -d
    $ component test

## License

  MIT
