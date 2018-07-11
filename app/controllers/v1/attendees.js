const express = require('express')
const request = require('request')
const Attendee = require('../../models/attendee')
const router = express.Router()
const { notifyStat } = require('../discordBot')

// Absolute path: /v1/attendees
router
  .route('/')
  .get(async (req, res) => {
    const attendees = await Attendee.find().exec()
    res.json(attendees)
  })
  // Create an attendee
  .post(async (req, res) => {
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
          }`
        )
      } else {
        res
          .status(400)
          .json({ message: 'Attendee with that email already exists' })
      }
    } catch (e) {}
  })

// Get, update, or delete an attendee by email
router
  .route('/email/:attendee_email')
  .get(async (req, res) => {
    try {
      const attendee = await Attendee.findOne({
        email: req.params.attendee_email
      }).exec()
      if (!attendee) {
        res.status(400).json({ message: 'Invalid email' })
      } else {
        res.json(attendee)
      }
    } catch (e) {}
  })
  .put(async (req, res) => {
    try {
      const attendee = await Attendee.findOne({
        email: req.params.attendee_email
      }).exec()
      Object.entries(req.body).forEach(([key, value]) => {
        attendee[key] = value
      })

      await attendee.save()
      res.json({ message: 'Attendee updated!' })
      notifyStat(
        `API: SUCCESS updated attendee by EMAIL ${req.params.attendee_email}`
      )
    } catch (e) {
      res.status(400).json({ message: 'Attendee not updated!' })
    }
  })
  .delete(async (req, res) => {
    try {
      const attendee = await Attendee.findOne({
        email: req.params.attendee_email
      }).exec()
      if (!attendee) {
        res.status(400).json({ message: 'Invalid attendee' })
      } else {
        const deletedAttendee = await Attendee.remove({
          email: req.params.attendee_email
        })
        res.json({ message: 'Successfully deleted attendee' })
        notifyStat(
          `API: SUCCESS deleted attendee by EMAIL ${
            req.params.attendee_email
          }, ID ${attendee.id}`
        )
      }
    } catch (e) {}
  })

// Get, update, or delete an attendee by ID
router
  .route('/id/:attendee_id')
  .get(async (req, res) => {
    try {
      const attendee = await Attendee.findById(req.params.attendee_id).exec()
      res.json(attendee)
    } catch (e) {}
  })
  .put(async (req, res) => {
    try {
      const attendee = await Attendee.findById(req.params.attendee_id).exec()
      Object.entries(req.body).forEach(([key, value]) => {
        attendee[key] = value
      })

      await attendee.save()
      res.json({ message: 'Attendee updated!' })
      notifyStat(
        `API: SUCCESS updated attendee with ID ${req.params.attendee_id}`
      )
    } catch (e) {
      res.status(400).json({ message: 'Attendee not updated!' })
    }
  })
  .delete(async (req, res) => {
    const attendee = await Attendee.remove({ _id: req.params.attendee_id })
    notifyStat(
      `API: Successfully deleted attendee by ID ${req.params.attendee_id}`
    )
    res.json({ message: 'Successfully deleted attendee' })
  })

router.route('/id/:attendee_id/approve').get(async (req, res) => {
  try {
    const attendee = await Attendee.findById(req.params.attendee_id).exec()
    request.post(
      process.env.MAILCHIMP_APPROVAL_URL,
      {
        json: { email_address: attendee.email },
        auth: {
          user: process.env.MAILCHIMP_APPROVAL_USERNAME,
          pass: process.env.MAILCHIMP_APPROVAL_PASSWORD
        }
      },
      async (error, response, body) => {
        if (response.statusCode !== 204) {
          notifyStat(
            `Error while approving attendee:\n\n\`\`\`${body.detail}\`\`\``
          )
          res.status(400).json({ message: body.detail })
        } else {
          attendee.isApproved = true
          await attendee.save()
          res.status(200).json({ message: 'Attendee approved!' })
          notifyStat(
            `API: SUCCESS approved attendee with ID ${
              req.params.attendee_id
            } and EMAIL ${attendee.email}`
          )
        }
      }
    )
  } catch (e) {}
})

module.exports = router
