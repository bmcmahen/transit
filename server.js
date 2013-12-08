
var express = require('express');
var hbs = require('hbs');


/**
 * App.
 */

var app = express()
  .use(express.static(__dirname))
  .set('views', __dirname)
  .engine('html', hbs.__express)
  .get('*', function (req, res) {
    res.render('example.html');
  })
  .listen(7777);