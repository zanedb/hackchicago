const express = require('express')
const Project = require('../../models/project')
const router = express.Router()
const { notifyStat } = require('../discordBot')

// Absolute path: /v1/projects
router
  .route('/')
  .get(async (req, res) => {
    const projects = await Project.find().exec()
    res.json(projects)
  })
  // Create a project
  .post(async (req, res) => {
    try {
      const projectResult = await Project.findOne({
        name: req.body.name
      }).exec()
      if (!projectResult) {
        const project = new Project()
        project.name = req.body.name
        // TODO: Require email to be logged in email
        // TODO: Add login system
        project.submitter = { email: req.body.email, id: req.body.id }
        project.tagline = req.body.tagline
        project.description = req.body.description
        project.timestamp = `${new Date().getMonth() +
          1}/${new Date().getDate()}/${new Date().getFullYear()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`

        await project.save()
        res.json({ message: 'Project created!' })
        notifyStat(
          `API: SUCCESS created PROJECT with NAME ${req.body.name}, by EMAIL ${
            project.submitter.email
          }`
        )
      } else {
        res
          .status(400)
          .json({ message: 'Project with that name already exists' })
      }
    } catch (e) {}
  })

module.exports = router
