const express = require('express')
const passport = require('passport')
const TokenStrategy = require('./tokenStrategy')
const router = express.Router()

passport.use(
  new TokenStrategy(
    {
      allowTokenReuse: true,
      tokenLifeTime: 1000 * 60 * 10,
      storeUri: process.env.MONGODB_URI,
      delivery: function(options) {
        return function(tokenToSend, uidToSend, recipient, callback, req) {
          const domain = 'http://localhost:3000'
          const loginLink = `${domain}/v1/auth/callback?token=${tokenToSend}&uid=${encodeURIComponent(
            uidToSend
          )}`
          console.log(`Link: ${loginLink}`)
          callback()
        }
      }
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
