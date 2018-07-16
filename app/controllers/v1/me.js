const express = require('express')
const router = express.Router()
const Upvote = require('../../models/upvote')
const Project = require('../../models/project')

router.route('/').get(async (req, res) => {
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
  user.id = req.user._id
  user.fname = req.user.fname
  user.lname = req.user.lname
  user.email = req.user.email
  user.phone = req.user.phone
  user.role = req.user.role
  res.status(200).json(user)
})

module.exports = router
