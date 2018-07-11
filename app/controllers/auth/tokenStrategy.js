const Token = require('../../models/token')
const crypto = require('crypto')
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
    // generate token
    console.log(`Token: ${cryptoRandomNumber(100000, 999999)}`);
    // token was sent, return 200
    self.fail(200)
  } else {
    // invalid request, return 400
    self.fail(400)
  }
}

function cryptoRandomNumber(min, max){
  const distance = max - min;
	const maxBytes = 3;
  const maxDec = 16777216;
  
	const randbytes = parseInt(crypto.randomBytes(maxBytes).toString('hex'), 16);
	let result = Math.floor(randbytes/maxDec*(max-min+1)+min);

  if(result>max) result = max;
  
	return result;
}

module.exports = Strategy
