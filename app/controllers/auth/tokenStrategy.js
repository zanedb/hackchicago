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
      // invalid token, return 401
      return self.fail(401)
    }
  } else if (email) {
    console.log(`TOKEN is ${authToken}`)
    // token was sent, return 200
    self.fail(200)
  } else {
    // invalid request, return 400
    self.fail(400)
  }
}

module.exports = Strategy
