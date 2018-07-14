const express = require('express')
const passport = require('passport')
const TokenStrategy = require('./tokenStrategy')
const router = express.Router()
const Attendee = require('../../models/attendee')

passport.use(
  new TokenStrategy(
    {
      allowTokenReuse: true,
      tokenLifeTime: 1000 * 60 * 15,
      sendgridApiKey: process.env.SENDGRID_API_KEY
    },
    function(req, user, done) {
      return done(null, user)
    }
  )
)

passport.serializeUser(function(user, done) {
  done(null, user.id)
})

passport.deserializeUser(async function(user, done) {
  try {
    const attendee = await Attendee.findById(user).exec()
    if (attendee) {
      done(null, attendee)
    } else {
      done(null, null)
    }
  } catch (ex) {
    throw new Error(ex)
  }
})

router.route('/').post(
  passport.authenticate('token', {
    successRedirect: '/auth/success'
  })
)

router.get('/logout', function(req, res) {
  req.logout()
  res.status(200).json({ message: 'Logged out!' })
})

router.route('/success').get(function(req, res) {
  res.status(200).json({ message: 'Authenticated!' })
})

router.route('/failure').get(function(req, res) {
  res.status(200).json({ message: 'Authentication failed.' })
})

module.exports = router
