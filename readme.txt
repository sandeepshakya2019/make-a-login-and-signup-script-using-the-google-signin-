1) First install all the npm packages, install the require packages
	express = require("express");
	bodyParser = require("body-parser");
	ejs = require("ejs");
	mongoose = require("mongoose");
	session = require('express-session');
	passport = require("passport");
	passportLocalMongoose = require("passport-local-mongoose");
	GoogleStrategy = require('passport-google-oauth20').Strategy;
	findOrCreate = require('mongoose-findorcreate');
2) Download this project make the .env file copy and paste the CLIENT_ID and Secrets_ID all are in capital letter. these all id's you will
when you will going to make the app in google developer console read the articles to create this (on my site https://webdblog.online/)
3) Now you can run the code using the nodemon if you get the any error try googling it ...