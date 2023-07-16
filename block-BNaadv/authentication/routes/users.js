var express = require("express");
var router = express.Router();
var User = require("../models/user");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("Authentication Required!");
});

// Register a user
router.get("/register", function (req, res, next) {
  var error = req.flash("error")[0];
  var success = req.flash("success")[0];
  res.render("register", {success, error});
});

router.post("/register", function (req, res, next) {
  const { email, password } = req.body;
  // Check if the email is already registered
  User.findOne({ email })
    .then((user) => {
      if (user) {
        // Email is already registered
        req.flash(
          "error",
          "Email is already registered. Please use a different email."
        );
        return res.redirect("/users/register");
      }

      // Check if the password is less than 5 characters
      if (req.body.password.length < 5) {
        req.flash("error", "Password should be at least 5 characters long.");
        return res.redirect("/users/register");
      }

      // Proceed with registration if everything is valid
      User.create(req.body)
        .then((newUser) => {
          req.flash(
            "success",
            "User registered successfully. You can now log in."
          );
          res.redirect("/users/login");
        })
        .catch((err) => {
          req.flash("error", "An error occurred. Please try again.");
          res.redirect("/users/register");
        });
    })
    .catch((err) => {
      req.flash("error", "An error occurred. Please try again.");
      return res.redirect("/users/register");
    });
});

//Login a user
router.get("/login", function (req, res, next) {
  var success = req.flash("success")[0];
  var error = req.flash("error")[0];
  res.render("login", {success, error});
});

router.post("/login", function (req, res, next) {
  var { email, password } = req.body;
  if (!email || !password) {
    req.flash("error", "Email/Password Required!" );
    return res.redirect("/users/login");
  }
  User.findOne({ email }).then((user) => {
    if (!user) {
      req.flash("error", "Email not registered");
      return res.redirect("/users/register");
    } 
    user.verifyPassword(password, (err, result) => {
      if (err) return next(err);
      if (!result) {
        req.flash("error", "Wrong Password!");
        res.redirect("/users/login");
      }
      //to persist logged in user info, create session
      req.session.userId = user.id;
      res.render("dashboard");
    });
  });
});

// Logout a user
router.get("/logout", (req, res, next) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/users/login');
})

module.exports = router;
