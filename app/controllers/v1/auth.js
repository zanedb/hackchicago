const Attendee = require('../../models/attendee')
const express = require('express')
const passwordless = require('passwordless')
const passwordlessMongoStore = require('passwordless-mongostore')
const router = express.Router()
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

passwordless.init(new passwordlessMongoStore(process.env.MONGODB_URI))
passwordless.addDelivery(async function(tokenToSend, uidToSend, recipient, callback) {
  const domain = 'http://localhost:3000'
  const loginLink = `${domain}/v1/auth/callback?token=${tokenToSend}&uid=${encodeURIComponent(uidToSend)}`;
  const msg = {
    to: recipient,
    from: {
      name: 'Hack Chicago Team',
      email: 'no-reply@hackchicago.io',
    },
    subject: 'Hack Chicago Magic Login Link',
    html: `Hi,<br>Somebody (hopefully you!) requested a login link for <a href="https://app.hackchicago.io">Hack Chicago</a>.<br><br>To login, please click below:<br><a href="${loginLink}">Magic Login Link</a><br><br>Thank you!`,
  };
  try {
    await sgMail.send(msg);
    callback()
  } catch (e) {}
})

router.route('/sendtoken').post(
  passwordless.requestToken(async function(user, delivery, callback, req) {
    const attendee = await Attendee.findOne({ email: user }).exec()
    if (attendee) {
      callback(null, attendee.id)
    } else {
      callback(null, null)
    }
  }),
  function(req, res) {
    res.status(200).json({ message: 'Token sent, please check your email.' })
  }
)

router.route('/callback').get(
  passwordless.acceptToken({
    successRedirect: '/v1/auth/success',
    failureRedirect: '/v1/auth/failure'
  })
)

router.route('/success').get(function(req, res) {
  res.status(200).json({ message: 'Authenticated!' })
})

router.route('/failure').get(function(req, res) {
  res.status(200).json({ message: 'Authentication failed.' })
})

module.exports = router
