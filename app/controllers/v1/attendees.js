const express = require('express')
const request = require('request')
const Attendee = require('../../models/attendee')
const Upvote = require('../../models/upvote')
const Project = require('../../models/project')
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

// Get, update, or delete an attendee by ID
router
  .route('/id/:attendee_id')
  .get(async (req, res) => {
    try {
      const attendee = await Attendee.findById(req.params.attendee_id).exec()
      let user = {}
      const upvotes = await Upvote.find({ submitterId: req.user._id }).exec()
      if (upvotes.length !== 0) user.upvotes = upvotes
      const project = await Project.findOne({
        submitter: {
          id: req.user.id
        }
      }).exec()
      if (project) {
        user.project = {
          id: project._id,
          name: project.name,
          link: project.link,
          tagline: project.tagline,
          description: project.description,
          timestamp: project.timestamp
        }
      }
      user.id = attendee._id
      user.fname = attendee.fname
      user.lname = attendee.lname
      user.email = attendee.email
      user.phone = attendee.phone
      user.gender = attendee.gender
      user.state = attendee.state
      user.city = attendee.city
      user.school = attendee.school
      user.grade = attendee.grade
      user.ref = attendee.ref
      user.internalNotes = attendee.internalNotes
      user.shirtSize = attendee.shirtSize
      user.dietRestrictions = attendee.dietRestrictions
      user.parentName = attendee.parentName
      user.parentEmail = attendee.parentEmail
      user.parentPhone = attendee.parentPhone
      user.timestamp = attendee.timestamp
      user.note = attendee.note
      user.role = attendee.role
      user.hasRegistered = attendee.hasRegistered
      user.isApproved = attendee.isApproved
      user.checkedIn = attendee.checkedIn
      user.waiverStatus = attendee.waiverStatus
      res.status(200).json(user)
    } catch (e) {
      res.sendStatus(500)
    }
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
