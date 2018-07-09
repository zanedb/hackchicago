const Attendee = require('../../models/attendee')
const express = require('express')
const router = express.Router()
const passwordless = require('passwordless')
const passwordlessMongoStore = require('passwordless-mongostore');

passwordless.init(new passwordlessMongoStore(process.env.MONGODB_URI));
passwordless.addDelivery(function(tokenToSend, uidToSend, recipient, callback) {
  const domain = 'http://localhost:3000';
  console.log(`${domain}/v1/auth/callback?token=${tokenToSend}&uid=${encodeURIComponent(uidToSend)}`);
  callback()
});

router
  .route('/sendtoken')
  .post(passwordless.requestToken(
    async function(user, delivery, callback, req) {
      const attendee = await Attendee.findOne({ email: user }).exec()
      if (attendee) {
        callback(null, attendee.id);
      } else {
        callback(null, null);
      }
    }
  ), function (req, res) {
    res.status(200).json({ message: 'Token sent, please check your email.' })
  })

router
  .route('/callback')
  .get(passwordless.acceptToken({ successRedirect: '/v1/auth/success', failureRedirect: '/v1/auth/failure' }));

router
  .route('/success')
  .get(function(req, res) {
    res.status(200).json({ message: 'Authenticated!' })
  })

router
  .route('/failure')
  .get(function(req, res) {
    res.status(200).json({ message: 'Authentication failed.' })
  })

module.exports = router