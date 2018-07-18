const express = require('express')
const Project = require('../../models/project')
const Attendee = require('../../models/attendee')
const Upvote = require('../../models/upvote')
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
    try {
      const projects = await Project.find().exec()
      let editedProjects = []
      // don't reveal sensitive info (i.e. email)
      for (const project of projects) {
        const upvotes = await Upvote.find({ projectId: project._id }).exec()
        const attendee = await Attendee.findById(project.submitter.id).exec()
        const editedProject = {
          name: project.name,
          link: project.link,
          tagline: project.tagline,
          description: project.description,
          timestamp: project.timestamp,
          upvotes: upvotes.length,
          submitter: {
            name: `${attendee.fname} ${attendee.lname.charAt(0)}.`
          },
          id: project._id
        }
        editedProjects.push(editedProject)
      }
      res.json(editedProjects)
    } catch (error) {
      res.sendStatus(500)
    }
  })
  // Create a project
  .post(async (req, res) => {
    if (
      req.body.name &&
      req.body.link &&
      checkLink(req.body.link) &&
      req.body.tagline &&
      req.body.description
    ) {
      try {
        const projectResult = await Project.findOne({
          submitter: {
            id: req.user.id
          }
        }).exec()
        if (!projectResult) {
          const project = new Project()
          project.name = req.body.name
          project.submitter = {
            id: req.user.id
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
            }, by EMAIL ${req.user.email}`
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
      const attendee = await Attendee.findById(project.submitter.id).exec()
      const upvotes = await Upvote.find({
        projectId: req.params.project_id
      }).exec()
      // don't reveal sensitive info (i.e. email)
      const editedProject = {
        name: project.name,
        link: project.link,
        tagline: project.tagline,
        description: project.description,
        timestamp: project.timestamp,
        upvotes: upvotes.length,
        submitter: {
          name: `${attendee.fname} ${attendee.lname.charAt(0)}.`
        },
        id: project._id
      }
      res.json(editedProject)
    } catch (e) {
      res.sendStatus(500)
    }
  })
  .put(async (req, res) => {
    try {
      const project = await Project.findById(req.params.project_id).exec()
      if (project.submitter.id === req.user._id.toString()) {
        if (req.body.link || req.body.tagline || req.body.description) {
          let changed = false
          if (
            req.body.link &&
            checkLink(req.body.link) &&
            req.body.link !== project.link
          ) {
            project.link = req.body.link
            changed = true
          }
          if (req.body.tagline && req.body.tagline !== project.tagline) {
            project.tagline = req.body.tagline
            changed = true
          }
          if (
            req.body.description &&
            req.body.description !== project.description
          ) {
            project.description = req.body.description
            changed = true
          }

          if (changed) {
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
      if (project) {
        const searchedUpvote = await Upvote.find({
          projectId: req.params.project_id,
          submitterId: req.user.id
        }).exec()
        if (searchedUpvote.length === 0) {
          const upvote = new Upvote()
          upvote.submitterId = req.user.id
          upvote.projectId = req.params.project_id
          upvote.timestamp = new Date().toISOString()
          await upvote.save()
          res.json({ message: 'Upvote added' })
        } else {
          res.status(400).json({ message: 'You have already upvoted this' })
        }
      }
    } catch (e) {
      res.sendStatus(500)
    }
  })
  .delete(async (req, res) => {
    try {
      const project = await Project.findById(req.params.project_id).exec()
      if (project) {
        const searchedUpvote = await Upvote.find({
          projectId: req.params.project_id,
          submitterId: req.user.id
        }).exec()
        if (searchedUpvote.length !== 0) {
          await Upvote.deleteOne({
            projectId: req.params.project_id,
            submitterId: req.user.id
          }).exec()
          res.json({ message: 'Upvote removed' })
        } else {
          res.status(400).json({ message: 'You have not upvoted this' })
        }
      }
    } catch (e) {
      res.sendStatus(500)
    }
  })

module.exports = router
