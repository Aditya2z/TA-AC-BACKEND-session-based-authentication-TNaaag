var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var flash = require('connect-flash');
var MongoStore = require('connect-mongo');
require('dotenv').config();
var User = require('./models/user');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productsRouter = require('./routes/products');
var adminRouter = require('./routes/admin');
const { default: mongoose } = require('mongoose');

var app = express();

mongoose.connect("mongodb://127.0.0.1/e-commerce").then(() => {
  console.log("Connected Successfully to e-commerce");
}).catch((err) => {
  console.log(err.message);
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
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongoUrl: "mongodb://127.0.0.1/e-commerce",
    })
  })
);

app.use(flash());

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

// Define a middleware function to check if the user is admin
function isAdmin(req, res, next) {
  // Check if the user is authenticated
  User.findById(req.session.userId).then((user) => {
    if (user.isAdmin) {
      // User is admin, proceed to the next middleware
      next();
    } else {
      // User is not admin, redirect to the login page
      req.flash("error", "Access Not authorised!");
      res.redirect("/products");
    }
  })
}

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', requireLoggedIn, productsRouter);
app.use('/admin', requireLoggedIn, isAdmin, adminRouter);

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
