const express = require('express')
const request = require('request')
const Attendee = require('../../../models/attendee')
const router = express.Router()
const { sendStat } = require('../../discordBot')

router
  .route('/')
  .get(async (req, res) => {
    const attendees = await Attendee.find().exec()
    res.json(attendees)
  })
  // Create an attendee (accessed at POST /api/v1/attendees)
  .post(async (req, res) => {
    try {
      const attendee = await Attendee.findOne({ email: req.body.email }).exec()
      if (!attendee) {
        const attendee = new Attendee()
        attendee.fname = req.body.fname
        attendee.lname = req.body.lname
        attendee.email = req.body.email
        attendee.state = req.body.state
        attendee.city = req.body.city
        attendee.school = req.body.school
        attendee.ref = req.body.ref
        attendee.grade = req.body.grade
        attendee.timestamp = req.body.timestamp
        attendee.note = req.body.note
        attendee.phone = req.body.phone
        attendee.shirtSize = req.body.shirtSize
        attendee.dietRestrictions = req.body.dietRestrictions
        attendee.gender = req.body.gender
        attendee.hasRegistered = false
        attendee.isApproved = false

        await attendee.save()
        res.json({ message: 'Attendee created!' })
        sendStat(
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

// get/update/delete attendees by email
router
  .route('/email/:attendee_email')
  // Get the attendee with that id (accessed at GET /api/v1/attendees/email/:attendee_email)
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
  // Update the attendee with this id (accessed at PUT /api/v1/attendees/email/:attendee_email)
  .put(async (req, res) => {
    try {
      const attendee = await Attendee.findOne({
        email: req.params.attendee_email
      }).exec()
      if (
        req.body.fname ||
        req.body.lname ||
        req.body.email ||
        req.body.state ||
        req.body.city ||
        req.body.school ||
        req.body.ref ||
        req.body.grade ||
        req.body.timestamp ||
        req.body.note ||
        req.body.phone ||
        req.body.shirtSize ||
        req.body.dietRestrictions ||
        req.body.gender
      ) {
        if (req.body.fname) attendee.fname = req.body.fname
        if (req.body.lname) attendee.lname = req.body.lname
        if (req.body.email) attendee.email = req.body.email
        if (req.body.state) attendee.state = req.body.state
        if (req.body.city) attendee.city = req.body.city
        if (req.body.school) attendee.school = req.body.school
        if (req.body.ref) attendee.ref = req.body.ref
        if (req.body.grade) attendee.grade = req.body.grade
        if (req.body.timestamp) attendee.timestamp = req.body.timestamp
        if (req.body.note) attendee.note = req.body.note
        if (req.body.phone) attendee.phone = req.body.phone
        if (req.body.shirtSize) attendee.shirtSize = req.body.shirtSize
        if (req.body.dietRestrictions)
          attendee.dietRestrictions = req.body.dietRestrictions
        if (req.body.gender) attendee.gender = req.body.gender

        await attendee.save()
        res.json({ message: 'Attendee updated!' })
        sendStat(
          `API: SUCCESS updated attendee by EMAIL ${req.params.attendee_email}`
        )
      } else {
        res.status(400).json({ message: 'Attendee not updated!' })
      }
    } catch (e) {}
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
        sendStat(
          `API: SUCCESS deleted attendee by EMAIL ${
            req.params.attendee_email
          }, ID ${attendee.id}`
        )
      }
    } catch (e) {}
  })

// get/update/delete attendees by ID
router
  .route('/id/:attendee_id')
  // Get the attendee with that id (accessed at GET /api/v1/attendees/id/:attendee_id)
  .get(async (req, res) => {
    try {
      const attendee = await Attendee.findById(req.params.attendee_id).exec()
      res.json(attendee)
    } catch (e) {}
  })
  // Update the attendee with this id (accessed at PUT /api/v1/attendees/id/:attendee_id)
  .put(async (req, res) => {
    try {
      const attendee = await Attendee.findById(req.params.attendee_id).exec()
      if (
        req.body.fname ||
        req.body.lname ||
        req.body.email ||
        req.body.state ||
        req.body.city ||
        req.body.school ||
        req.body.ref ||
        req.body.grade ||
        req.body.timestamp ||
        req.body.note ||
        req.body.phone ||
        req.body.shirtSize ||
        req.body.dietRestrictions ||
        req.body.gender
      ) {
        if (req.body.fname) attendee.fname = req.body.fname
        if (req.body.lname) attendee.lname = req.body.lname
        if (req.body.email) attendee.email = req.body.email
        if (req.body.state) attendee.state = req.body.state
        if (req.body.city) attendee.city = req.body.city
        if (req.body.school) attendee.school = req.body.school
        if (req.body.ref) attendee.ref = req.body.ref
        if (req.body.grade) attendee.grade = req.body.grade
        if (req.body.timestamp) attendee.timestamp = req.body.timestamp
        if (req.body.note) attendee.note = req.body.note
        if (req.body.phone) attendee.phone = req.body.phone
        if (req.body.shirtSize) attendee.shirtSize = req.body.shirtSize
        if (req.body.dietRestrictions)
          attendee.dietRestrictions = req.body.dietRestrictions
        if (req.body.gender) attendee.gender = req.body.gender

        await attendee.save()
        res.json({ message: 'Attendee updated!' })
        sendStat(
          `API: SUCCESS updated attendee with ID ${req.params.attendee_id}`
        )
      } else {
        res.status(400).json({ message: 'Attendee not updated!' })
      }
    } catch (e) {}
  })
  .delete(async (req, res) => {
    const attendee = await Attendee.remove({ _id: req.params.attendee_id })
    sendStat(
      `API: Successfully deleted attendee by ID ${req.params.attendee_id}`
    )
    res.json({ message: 'Successfully deleted attendee' })
  })

// Endpoint to approve attendees
router
  .route('/id/:attendee_id/approve')
  // Accessed at GET /api/v1/attendees/id/:attendee_id/approve
  .post(async (req, res) => {
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
            sendStat(
              `Error while approving attendee:\n\n\`\`\`${body.detail}\`\`\``
            )
            res.status(400).json({ message: body.detail })
          } else {
            attendee.isApproved = true
            await attendee.save()
            res.status(200).json({ message: 'Attendee approved!' })
            sendStat(
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
