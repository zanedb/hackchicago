const express = require('express')
const Project = require('../../../models/project')
const router = express.Router()

router
  .route('/')
  .get((req, res) => {
    Project.find((err, projects) => {
      if (err) {
        res.send(err)
      } else {
        res.status(200).json(projects)
      }
    })
  })
  // Create a project (accessed at POST /api/v1/projects)
  .post((req, res) => {
    Project.findOne({ name: req.body.name }, (err, projectResult) => {
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

        project.save((err, project) => {
          if (err) {
            res.send(err)
          } else {
            res.json({ message: 'Project created!' })
            sendStat(
              `API: SUCCESS created PROJECT with NAME ${
                req.body.name
              }, by EMAIL ${project.submitter.email}`
            )
          }
        })
      } else {
        res
          .status(400)
          .json({ message: 'Project with that name already exists' })
      }
    })
  })

module.exports = router
