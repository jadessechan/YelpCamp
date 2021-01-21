var createError          = require('http-errors'),
    express              = require('express'),
    path                 = require('path'),
    cookieParser         = require('cookie-parser'),
    passport             = require("passport");
    LocalStrategy        = require("passport-local"),
    logger               = require('morgan'),
    campground           = require('./models/campground'),
    User                 = require('./models/user'),
    methodOverride       = require('method-override'),
    seedDB               = require('./seeds');


var app = express();
var mongoose = require('mongoose');

// seedDB();


mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect("mongodb://localhost/yelp_camp");

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride("_method"));

// middle ware
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
})

// Change Global Variables for Header and Footer Here
app.locals.globalTitle = "YelpCamp";
app.locals.globalCSS = '/stylesheets/style.css';
app.locals.globalJS = '/javascripts/index.js';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//  PASSPORT CONFIGURATION
app.use(require("express-session")({
  secret: "I still love Tim the most",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


var indexRouter            = require('./routes/index'),
    campgroundsRouter      = require('./routes/campgrounds'),
    newCampgroundRouter    = require('./routes/newCampground'),
    registerRouter         = require('./routes/register'),
    loginRouter            = require('./routes/login'),
    logoutRouter           = require('./routes/logout');

app.use('/', indexRouter);
app.use('/campgrounds/new', newCampgroundRouter);
app.use('/campgrounds', campgroundsRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);

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
