const Token = require('../../models/token')
const crypto = require('crypto')
const passport = require('passport-strategy')
const util = require('util')
const sgMail = require('@sendgrid/mail')

function Strategy(options, verify) {
  sgMail.setApiKey(options.sendgridApiKey)

  passport.Strategy.call(this)
  this.name = 'token'
}

util.inherits(Strategy, passport.Strategy)

Strategy.prototype.authenticate = async function(req, options) {
  options = options || {}
  const email = req.body.email
  const token = req.body.token

  const self = this

  // TEMPORARY
  const authToken = 'abc'
  if (email && token) {
    if (token === authToken) {
      console.log(`Email: ${email}, with token: ${token}. VERIFIED`)
      self.success({ email: email })
    } else {
      // invalid token, return 401
      return self.fail(401)
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
    const msg = {
      to: email,
      from: {
        email: 'no-reply@hackchicago.io',
        name: 'Hack Chicago Team',
      },
      subject: `Hack Chicago Login Code: ${token}`,
      html: `Hi,<br/><br/>Somebody (hopefully you!) requested a login code for Hack Chicago.<br/>Your login code is <b>${token}</b>. It will expire in 15 minutes.<br/><br/>- Hack Chicago`
    }
    try {
      sgMail.send(msg)
    } catch (ex) {
      throw new Error(ex)
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
