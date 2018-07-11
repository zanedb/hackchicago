const passport = require('passport-strategy')
const util = require('util')

function Strategy(options, verify) {
  passport.Strategy.call(this)
  this.name = 'token'
}

util.inherits(Strategy, passport.Strategy)

Strategy.prototype.authenticate = function(req, options) {
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
      return this.fail(
        { message: options.invalidTokenMessage || 'Invalid token' },
        401
      )
    }
  } else if (email) {
    console.log(`TOKEN is ${authToken}`)
    self.fail({ message: 'Check your email!' }, 200)
  } else {
    self.fail(
      { message: options.badOptionsMessage || 'Missing credentials' },
      400
    )
  }
}

module.exports = Strategy
