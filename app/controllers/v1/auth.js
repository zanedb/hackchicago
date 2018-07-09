const Attendee = require('../../models/attendee')
const express = require('express')
const router = express.Router()
const passwordless = require('passwordless')
const passwordlessMongoStore = require('passwordless-mongostore');

passwordless.init(new passwordlessMongoStore(process.env.MONGODB_URI));
passwordless.addDelivery(function(tokenToSend, uidToSend, recipient, callback) {
  const domain = 'http://localhost:3000';
  console.log(`${domain}/callback?token=${tokenToSend}&uid=${encodeURIComponent(uidToSend)}`);
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
  .get(passwordless.acceptToken({ successRedirect: 'https://google.com' }));

module.exports = router