var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { default: mongoose } = require('mongoose');
var session = require('express-session');
const MongoStore = require('connect-mongo');
var flash = require("connect-flash");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var articlesRouter = require('./routes/articles');
const commentsRouter = require('./routes/comments');

mongoose.connect("mongodb://127.0.0.1/blog").then(() => {
  console.log("Connected Successfully to blog database");
}).catch((err) => {
  console.log("Error connecting to blog database");
});

var app = express();
require('dotenv').config();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//session
app.use(
  session({
  secret: process.env.secret,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongoUrl: "mongodb://127.0.0.1/blog"
  })
}));

// flash
app.use(flash());

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Define a middleware function to check if the user is logged in
function requireLoggedIn(req, res, next) {
  // Check if the user is authenticated
  if (req.session.userId) {
    // User is logged in, proceed to the next middleware
    next();
  } else {
    // User is not logged in, redirect to the login page
    req.flash("error", "Authentication Required, Login first!")
    res.redirect("/users/login");
  }
}

// Apply the middleware to the '/articles' route
app.use('/articles', requireLoggedIn, articlesRouter);
app.use('/comments', requireLoggedIn, commentsRouter);

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
