const express = require('express')
const router = express.Router()
const { notifyStat } = require('../discordBot')
const Attendee = require('../../models/attendee')

router.route('/').post(async (req, res) => {
  if (req.get('Auth') === process.env.AUTH_KEY) {
    try {
      const attendee = await Attendee.findOne({ email: req.body.email }).exec()
      if (!attendee) {
        const attendee = new Attendee()
        Object.entries(req.body).forEach(([key, value]) => {
          attendee[key] = value
        })

        await attendee.save()
        res.json({ message: 'Attendee created!' })
        notifyStat(
          `API: SUCCESS created attendee with EMAIL ${req.body.email}, ID ${
            attendee.id
          }, via ZAPIER`
        )
      } else {
        res
          .status(400)
          .json({ message: 'Attendee with that email already exists' })
      }
    } catch (e) {}
  } else {
    res.status(401).json({ message: 'You do not have access.' })
  }
})

module.exports = router
