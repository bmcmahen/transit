var path = require('path');
var express = require('express');
var hbs = require('hbs');


/**
 * App.
 */

var app = express()
  .use(express.static(__dirname))
  .set('views', path.join(__dirname, '/test'))
  .engine('html', hbs.__express)
  .get('*', function (req, res) {
    res.render('index.html');
  })
  .listen(7777);