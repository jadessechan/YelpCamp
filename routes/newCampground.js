var express = require('express');
var router = express.Router();

//NEW - show form to create new campground
router.get('/', isLoggedIn, (req, res) =>{
    res.render("campgrounds/new");
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports = router;
