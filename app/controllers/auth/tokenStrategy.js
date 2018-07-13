const Attendee = require('./../../models/attendee')
const Token = require('../../models/token')
const crypto = require('crypto')
const passport = require('passport-strategy')
const util = require('util')
const sgMail = require('@sendgrid/mail')

function Strategy(options, verify) {
  sgMail.setApiKey(options.sendgridApiKey)

  this._tokenLifeTime = options.tokenLifeTime || 1000 * 60 * 10
  passport.Strategy.call(this)
  this.name = 'token'
}

util.inherits(Strategy, passport.Strategy)

Strategy.prototype.authenticate = async function(req, options) {
  options = options || {}
  const email = req.body.email
  const token = req.body.token

  const self = this

  if (email && token) {
    try {
      const retrievedTokens = await Token.find({
        email
      }).exec()
      let tokenFound = false
      for (const potentialToken of retrievedTokens) {
        // check for token expiration + validity
        if (
          Date.now() - Date.parse(potentialToken.timestamp) <
            this._tokenLifeTime &&
          potentialToken.token === token
        ) {
          tokenFound = true
          break
        }
      }
      if (tokenFound) {
        await Token.deleteMany({ email }).exec()
        const attendee = await Attendee.findOne({ email }).exec()
        if (attendee) {
          self.success(attendee)
        } else {
          self.fail(401)
        }
      } else {
        // invalid token, return 401
        return self.fail(401)
      }
    } catch (ex) {
      throw new Error(ex)
    }
  } else if (email) {
    // generate + store token
    const token = cryptoRandomNumber(100000, 999999)
    const storedToken = new Token()
    storedToken.email = email
    storedToken.token = token
    storedToken.timestamp = new Date().toISOString()
    try {
      await storedToken.save()
    } catch (ex) {
      throw new Error(ex)
    }
    if (process.env.NODE_ENV === 'production') {
      // send token
      const msg = {
        to: email,
        from: {
          email: 'no-reply@hackchicago.io',
          name: 'Hack Chicago Team'
        },
        subject: `Hack Chicago Login Code: ${token}`,
        html: `Hi,<br/><br/>Somebody (hopefully you!) requested a login code for Hack Chicago.<br/>Your login code is <b>${token}</b>. It will expire in 15 minutes.<br/><br/>- Hack Chicago`
      }
      try {
        sgMail.send(msg)
      } catch (ex) {
        throw new Error(ex)
      }
    } else {
      // if testing, console.log to not waste emails
      console.log(`Token: ${token}`)
    }
    // token was sent, return 200
    self.fail(200)
  } else {
    // invalid request, return 400
    self.fail(400)
  }
}

function cryptoRandomNumber(min, max) {
  const distance = max - min
  const maxBytes = 3
  const maxDec = 16777216

  const randbytes = parseInt(crypto.randomBytes(maxBytes).toString('hex'), 16)
  let result = Math.floor((randbytes / maxDec) * (max - min + 1) + min)

  if (result > max) result = max

  return result
}

module.exports = Strategy
