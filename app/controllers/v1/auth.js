const express = require('express')
const passport = require('passport')
const PasswordlessStrategy = require('passport-passwordless')
const router = express.Router()

passport.use(
  new PasswordlessStrategy(
    {
      allowTokenReuse: true,
      tokenLifeTime: 1000 * 60 * 10,

      store: {
        path: './../../passwordless-mongostore',
        config: process.env.MONGODB_URI
      },
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
      return done(null, user)
    }
  )
)

router.route('/').post(passport.authenticate('passwordless', {
  successRedirect: '/v1/auth/success',
  failureRedirect: '/v1/auth/failure'
}))

router.route('/success').get(function(req, res) {
  res.status(200).json({ message: 'Authenticated!' })
})

router.route('/failure').get(function(req, res) {
  res.status(200).json({ message: 'Authentication failed.' })
})

module.exports = router
