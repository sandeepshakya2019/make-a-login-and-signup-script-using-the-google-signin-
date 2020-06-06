//jshint esversion:6
require('dotenv').config();
// require the npm packages
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
// defining the app instance
const app = express();
// to use the puclic files like css, js
app.use(express.static("public"));
// to use the view engine ejs (embedded java script)
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
// using the session 
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));
// initialize the passport and passport session
app.use(passport.initialize());
app.use(passport.session());
// connection with mongoDB and use the database UserDB
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);
// making the schema
const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId: String,
  secret: String
});
// use the passport plugin
userSchema.plugin(passportLocalMongoose);
// use the plugin findOrCreate
userSchema.plugin(findOrCreate);
// making a collection called users
const User = new mongoose.model("User", userSchema);
// creating the startegy
passport.use(User.createStrategy());
// serializing the user
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
// desearliczed the user
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
// making the google startegy
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    //
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
// root directory homne
app.get("/", function(req, res){
  res.render("home");

});

// google auth route
app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);
//
app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/secrets");
  });
// login route
app.get("/login", function(req, res){
  res.render("login");
});
//register route
app.get("/register", function(req, res){
  res.render("register");
});
// secrets route
app.get("/secrets", function(req, res){
  User.find({"secret": {$ne: null}}, function(err, foundUsers){
    if (err){
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("secrets", {usersWithSecrets: foundUsers});
      }
    }
  });
});

app.get("/submit", function(req, res){
  if (req.isAuthenticated()){
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});

app.post("/submit", function(req, res){
  const submittedSecret = req.body.secret;

//Once the user is authenticated and their session gets saved, their user details are saved to req.user.
  // console.log(req.user.id);

  User.findById(req.user.id, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.secret = submittedSecret;
        foundUser.save(function(){
          res.redirect("/secrets");
        });
      }
    }
  });
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});

app.post("/login", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});







app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
