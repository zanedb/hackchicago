const express = require('express')
const passport = require('passport')
const TokenStrategy = require('./tokenStrategy')
const router = express.Router()

passport.use(
  new TokenStrategy(
    {
      allowTokenReuse: true,
      tokenLifeTime: 1000 * 60 * 10,
      sendgridApiKey: process.env.SENDGRID_API_KEY
    },
    function(req, user, done) {
      //.. validate the logged in user and build your final user object
      console.log(user)
      return done(null, user)
    }
  )
)

passport.serializeUser(function(user, done) {
  done(null, user)
})

passport.deserializeUser(function(user, done) {
  done(null, user)
})

router.route('/').post(
  passport.authenticate('token', {
    successRedirect: '/auth/success'
  })
)

router.get('/logout', function(req, res) {
  req.logout()
  res.redirect('/')
})

router.route('/success').get(function(req, res) {
  res.status(200).json({ message: 'Authenticated!' })
})

router.route('/failure').get(function(req, res) {
  res.status(200).json({ message: 'Authentication failed.' })
})

module.exports = router
