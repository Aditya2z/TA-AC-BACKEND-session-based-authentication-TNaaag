var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
const MongoStore = require('connect-mongo');
var flash = require("connect-flash");


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const { default: mongoose, Connection } = require('mongoose');

var app = express();

require('dotenv').config();

mongoose.connect("mongodb://127.0.0.1/authentication").then(() => {
  console.log("Connected to Authenticaton DB");
}).catch((err) => {
  next(err);
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
  secret: process.env.secret,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongoUrl: "mongodb://127.0.0.1/authentication"
  })
}));

app.use(flash());

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
