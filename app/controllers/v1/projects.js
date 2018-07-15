const express = require('express')
const Project = require('../../models/project')
const router = express.Router()
const { notifyStat } = require('../discordBot')

// Absolute path: /v1/projects
router
  .route('/')
  .get(async (req, res) => {
    const projects = await Project.find().exec()
    let editedProjects = []
    // don't reveal sensitive info (i.e. email)
    for (const project of projects) {
      const editedProject = {
        name: project.name,
        link: project.link,
        tagline: project.tagline,
        description: project.description,
        timestamp: project.timestamp,
        upvotes: project.upvotes.length,
        submitter: {
          name: project.submitter.name
        },
        id: project._id
      }
      editedProjects.push(editedProject)
    }
    res.json(editedProjects)
  })
  // Create a project
  .post(async (req, res) => {
    try {
      const projectResult = await Project.findOne({
        submitter: {
          email: req.user.email,
          id: req.user.id,
          name: `${req.user.fname} ${req.user.lname.charAt(0)}.`
        }
      }).exec()
      if (!projectResult) {
        const project = new Project()
        project.name = req.body.name
        project.submitter = {
          email: req.user.email,
          id: req.user.id,
          name: `${req.user.fname} ${req.user.lname.charAt(0)}.`
        }
        project.link = req.body.link
        project.tagline = req.body.tagline
        project.description = req.body.description
        project.timestamp = new Date().toISOString()

        await project.save()
        res.json({ message: 'Project created!' })
        notifyStat(
          `API: SUCCESS created PROJECT with NAME ${req.body.name}, by EMAIL ${
            project.submitter.email
          }`
        )
      } else {
        res.status(400).json({ message: 'You have already created a project.' })
      }
    } catch (e) {}
  })

// Absolute path: /v1/projects/:project_id
router.route('/:project_id').get(async (req, res) => {
  try {
    const project = await Project.findById(req.params.project_id).exec()
    // don't reveal sensitive info (i.e. email)
    const editedProject = {
      name: project.name,
      link: project.link,
      tagline: project.tagline,
      description: project.description,
      timestamp: project.timestamp,
      upvotes: project.upvotes.length,
      submitter: {
        name: project.submitter.name
      },
      id: project._id
    }
    res.json(editedProject)
  } catch (e) {}
})

module.exports = router
