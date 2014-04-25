
# Transit

  So it's yet _another_ router. This is basically a combination of a myraid of other routers out there, but made to my preference. It takes after `visionmedia/page.js`, but it also supports hash-based fallbacks in IE 8 and 9. 


## Installation

  Install with [component(1)](http://component.io):

    $ component install bmcmahen/transit

## API

### #start

Begin listening for URL changes. Typically you will call this after specifying all of your routes.

### #listen(root)

Active click delegation for paths in `root`. If the path is specified in your router it will push and execute the URL and its functions. 

```javascript
transit.listen('/');
transit('/bacon', getBacon);
```

```html
<a href='/bacon'>Get Bacon</a>
```

When Get Bacon is clicked, the getBacon function will run.

### #push(url)

Update the URL and add it to the history without executing the specified callbacks.

```javascript
transit.push('/bacon');
```

### #exec(url)

Execute the specified callbacks for the provided URL without manipulating the URL or adding it to the history.

```javascript
transit.exec('/bacon');
```

### #go(url)

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
route.listen('/');

function myname(ctx, next){
  ctx.name = ctx.params.first || 'foo';
  next();
}

function lastname(ctx){
  var lastname = ctx.params.last || 'bar';
  console.log(ctx.name +' '+ lastname);
}

function after(ctx){
  console.log('this is a lame example.');
}

route('/name', myname, lastname);
route('/name/:first', myname, lastname);
route('/name/:first/:last', myname, lastname).out(after);

route.start();
```

## TODO

- Improve middleware to handle errors, pass args, etc.
- Set base URL
- more tests

## Running Tests

    $ npm install component-test -g
    $ component build -d
    $ component test

## License

  MIT
