var express = require("express");
var router = express.Router();
var User = require("../models/user");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("Authentication Required!");
});

// Register a user
router.get("/register", function (req, res, next) {
  res.render("register");
});

router.post("/register", function (req, res, next) {
  User.create(req.body).then((newUser) => {
    res.redirect("/users/login");
  });
});

//Login a user
router.get("/login", function (req, res, next) {
  res.render("login");
});

router.post("/login", function (req, res, next) {
  var{email, password} = req.body;
  if(!email || !password) {
   return res.redirect("/users/login");
  }
  User.findOne({email}).then((user) => {
    if(!user) return res.redirect('/users/register');
    user.verifyPassword(password, (err, result) => {
      if(err) return next(err);
      if(!result) {
        res.redirect('/users/login');
      }
      //to persist logged in user info, create session
      req.session.userId = user.id;
      res.render('dashboard', {user : user});
    })
  })
});

module.exports = router;
