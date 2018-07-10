const express = require('express')
const passport = require('passport')
const PasswordlessStrategy = require('passport-passwordless').Strategy;
const router = express.Router()

passport.use(new PasswordlessStrategy({ 
  //... configuration ... 
  }, function (req, user, done) {
    //.. validate the logged in user and build your final user object
    return done(null, user);
  }
));

router.post('/login',
  passport.authenticate('local'), { 
    successRedirect: '/',
    failureRedirect: '/login'
  });

module.exports = router