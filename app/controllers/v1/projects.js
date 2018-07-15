const express = require('express')
const Project = require('../../models/project')
const router = express.Router()
const { notifyStat } = require('../discordBot')

function checkLink(url) {
  // https://stackoverflow.com/a/14582229
  const urlRegex = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ) // fragment locator
  return urlRegex.test(url)
}

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
    if (
      req.body.name &&
      req.body.link &&
      checkLink(req.body.link) &&
      req.body.tagline &&
      req.body.description &&
      req.body.timestamp
    ) {
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
            `API: SUCCESS created PROJECT with NAME ${
              req.body.name
            }, by EMAIL ${project.submitter.email}`
          )
        } else {
          res
            .status(400)
            .json({ message: 'You have already created a project.' })
        }
      } catch (e) {}
    } else {
      res.sendStatus(400)
    }
  })

// Absolute path: /v1/projects/:project_id
router
  .route('/:project_id')
  .get(async (req, res) => {
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
  .put(async (req, res) => {
    try {
      const project = await Project.findById(req.params.project_id).exec()
      if (project.submitter.id === req.user._id.toString()) {
        if (req.body.link || req.body.tagline || req.body.description) {
          if (req.body.link && checkLink(req.body.link))
            project.link = req.body.link
          if (req.body.tagline) project.tagline = req.body.tagline
          if (req.body.description) project.description = req.body.description

          await project.save()
          res.json({ message: 'Project updated!' })
          notifyStat(
            `API: SUCCESS updated project with NAME ${project.name}, ID ${
              req.params.attendee_id
            }`
          )
        } else {
          res.sendStatus(400)
        }
      } else {
        res
          .status(401)
          .json({ message: 'You do not have access to this project.' })
      }
    } catch (e) {
      res.status(400).json({ message: 'Project not updated!' })
    }
  })

// Absolute path: /v1/projects/:project_id/upvotes
router
  .route('/:project_id/upvotes')
  .post(async (req, res) => {
    try {
      const project = await Project.findById(req.params.project_id).exec()
      for (const upvote of project.upvotes) {
        if (req.user._id.toString() === upvote.id.toString()) {
          res.status(400).json({ message: 'You have already upvoted this' })
        }
      }
      const upvote = {
        id: req.user._id,
        email: req.user.email
      }
      project.upvotes.push(upvote)
      await project.save()
      res.json({ message: 'Upvote added' })
    } catch (e) {}
  })
  .delete(async (req, res) => {
    try {
      const project = await Project.findById(req.params.project_id).exec()
      let upvoteDeleted = false
      for (let i = 0; i < project.upvotes.length; i++) {
        if (req.user._id.toString() === project.upvotes[i].id.toString()) {
          project.upvotes.splice(i, 1)
          upvoteDeleted = true
        }
      }
      if (upvoteDeleted) {
        await project.save()
        res.json({ message: 'Upvote removed' })
      } else {
        res.json({ message: 'Upvote not found' })
      }
    } catch (e) {}
  })

module.exports = router
