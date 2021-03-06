const express = require('express')
const router = express.Router()
const request = require('request')
const { notifyStat } = require('../discordBot')

router.route('/').post((req, res) => {
  // temporary redirect
  res.redirect(
    302,
    'https://hackchicago.io/sign?error=This page is not ready yet.'
  )
  // MAKE REQUEST TO SIGNATURE API
  /*const package_id = '';
    const bearerToken = '';
    request.post(`https://api.signinghub.com/v3/packages/${package_id}/workflow/users`, {
      'auth': {
        'bearer': bearerToken
      },
      body: {
        user_email: req.body.studentEmail,
        user_name: req.body.studentName,
        role: "Signer",
        email_notification: true
      }
    })*/
})

module.exports = router
