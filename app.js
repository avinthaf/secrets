//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs")
const bodyParser = require("body-parser")
const mongoose = require("mongoose");
const _ = require("lodash");
const encrypt = require("mongoose-encryption");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

mongoose.set('useFindAndModify', false);

//Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true, useUnifiedTopology: true});

//Create a user schema 
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});



//specify which field you're going to encrypt by passing it in to the encryptedFields property
//We're only encrypting the password field because we're using email to find documents inside the database
//The field is passed into an array and you can add multiple fields to it
//Pass in the SECRET environment variable inside the .env file as the secret key
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

//Create a User model
const User = mongoose.model("User", userSchema);



//Handle get routes
app.get("/", function(req, res) {
    res.render("home");
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/register", function(req, res) {
    res.render("register");
});

//Notice that there isn't a get handler for the secrets page
//This is because we only want a user to arrive at that page once they're logged in or verified


//Handle post routes 

//Register a new user
app.post("/register", function(req, res) {
    //Pass in the posted email and password into a new User object using the User model
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    })
    //save the user
    newUser.save(function(err) {
        //if there are any errors console log them
        if(err) {
            console.log(err)
            //else render the secrets page
        } else {
            res.render("secrets")
        }
    });
});

//User login
app.post("/login", function(req, res) {
    //save email and password into variables
    const email = req.body.username;
    const password = req.body.password;
    //Check if user exists in database
    User.findOne({email: email}, function(err, foundUser) {
        if(err) {
            console.log(err);
        } else {
            //if user exists then check whether password is correct
            if(foundUser) {
                if(foundUser.password === password) {
                    res.render("secrets")
                } else {
                    //say password is incorrect
                    console.log("password incorrect")
                }
                //else say user doesn't exist
            } else {
                console.log("User doesn't exist")
            }
        }
    });
});



app.listen(3000, function() {
    console.log("Server started on port 3000");
  });