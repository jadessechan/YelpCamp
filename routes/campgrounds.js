var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Campground = require("../models/campground");
var Comment = require('../models/comment');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);


// Get all campgrounds from DB
router.get("/", function(req, res){
    Campground.find({}, (err, allCampgrounds) => {
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/campgrounds", {campgrounds: allCampgrounds, currentUser: req.user});
        }
    });
});

//CREATE - add new campground to db
router.post('/', isLoggedIn, (req, res) => {
    //  get data from form and add to campgrounds array
    let newCampground = {
        name: req.body.name,
        image: req.body.image,
        description: req.body.description,
        author: {
            id: req.user._id,
            username: req.user.username
        },
    };

    //create new campground and save to database
    Campground.create(newCampground, (err, newlyCreated) => {
        if (err) {
            console.log("error");
        } else {
            //  redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
});

//SHOW - shows more info about one campground
router.get('/:id', (req, res) => {
    //find campground with provided id
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
        if (err) {
            console.log(err);
        }
        else {
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground, currentUser: req.user});
            }
        });
    });


//EDIT campground
router.get('/:id/edit', checkCampgroundUser, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        res.render('campgrounds/edit', {campground: foundCampground, currentUser: req.user});
    });
});

//UPDATE campground
router.put('/:id', checkCampgroundUser, (req, res) => {
//    find and update correct campground
    let data = {
        name: req.body.name,
        image: req.body.image,
        description: req.body.description
    }
    Campground.findByIdAndUpdate(req.params.id, data, (err, updatedCampground) => {
        if (err) {
            res.redirect('/campgrounds');
        }
        else {
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

// DESTROY
router.delete('/:id', checkCampgroundUser, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            res.redirect('/campgrounds');
        }
        else {
            res.redirect('/campgrounds');
        }
    })
})



//COMMENTS

router.get('/:id/comments/new', isLoggedIn, (req, res) => {
    // find campground by id
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err);
        }
        else {
            res.render("comments/new", {campground: campground});
        }
    });
});


// create new comment
router.post('/:id/comments', isLoggedIn, (req, res) => {
//    lookup campground using id
    Campground.findById(req.params.id, (err, campground) => {
       if (err) {
           console.log(err);
           res.redirect("/campgrounds");
       }
       else {

            let newComment = {
                text: req.body.text,
                author: req.body.author
            }
            Comment.create(newComment, (err, comment) => {
                if (err) {
                    console.log(err);
                }
                else {
                    // add username and id
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
       }
    });
});

// edit comment
router.get('/:id/comments/:comment_id/edit', (req, res) => {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
        if (err) {
            res.redirect('back');
        }
        else {
            res.render('comments/edit', {campground_id: req.params.id, comment: foundComment, currentUser: req.user});
        }
    });
});

// update comment
router.put('/:id/comments/:comment_id', (req, res) => {
    let newComment = {
        text: req.body.text
    };

    Comment.findByIdAndUpdate(req.params.comment_id, newComment, (err, UpdatedComment) => {
        if (err) {
            res.redirect('back');
        }
        else {
            res.redirect('/campgrounds/' + req.params.id);
        }
    })
});

// destroy comments
router.delete('/:id/comments/:comment_id', (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (err) => {
        if (err) {
            res.redirect('back');
        }
        else {
            res.redirect(`/campgrounds/${req.params.id}`);
        }
    });
})


// MIDDLEWARE
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

function checkCampgroundUser(req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, (err, foundCampground) => {
            //does current user match with the campground's user
            if (err) {
                res.redirect('back');
            }
            else {
                if (foundCampground.author.id.equals(req.user._id)) {
                    next();
                }
                else {
                    res.redirect('back');
                }
            }
        });
    }
    else {
        console.log("need to log in");
        res.redirect('back');
    }
}


module.exports = router;