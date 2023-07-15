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
    console.log(newUser);
    res.redirect("/users/login");
  });
});

//Login a user
router.get("/login", function (req, res, next) {
  res.render("login");
});

module.exports = router;
