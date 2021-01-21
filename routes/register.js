var express = require('express');
var router = express.Router();
var User = require("../models/user");
var passport = require('passport');
var LocalStrategy = require("passport-local");

router.get('/', (req, res) => {
    res.render("register");
});

router.post('/', (req, res) => {
    let newUser = new User({
        username: req.body.username
    });
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            return res.render('register');
        }
        passport.authenticate("local")(req, res, () => {
            res.redirect('/campgrounds');
        });
    });
});

module.exports = router;
