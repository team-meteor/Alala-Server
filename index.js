var express = require('express')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var multer = require('multer')

var app = express()
// connect to database
mongoose.connect('mongodb://localhost:27017/insta')

// middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

// static file 
app.use(express.static('uploads'))

// get routers/index.js
var routes = require('./routes')

// /api router
app.use('/api', routes)

// attach server
app.set('port', process.env.PORT || 8000)
var server = app.listen(app.get('port'), function() {
    console.log('server started');
});