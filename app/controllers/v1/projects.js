const express = require('express')
const Project = require('../../models/project')
const Attendee = require('../../models/attendee')
const Upvote = require('../../models/upvote')
const router = express.Router()
const { notifyStat } = require('../discordBot')
const scrapeIt = require('scrape-it')

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
          timestamp: project.timestamp,
          image: project.image,
          submitter: {
            name: `${attendee.fname} ${attendee.lname.charAt(0)}.`
          },
          id: project._id
        }
        if (req.user.role === 'admin') editedProject.upvotes = upvotes.length
        editedProjects.push(editedProject)
      }
      res.json(editedProjects)
    } catch (error) {
      console.log(error)
      res.sendStatus(500)
    }
  })
  // Create a project
  .post(async (req, res) => {
    if (req.body.link) {
      try {
        const projectResult = await Project.findOne({
          submitter: {
            id: req.user.id
          }
        }).exec()
        if (!projectResult) {
          scrapeIt(req.body.link, {
            title: '#app-title',
            desc: '.large',
            image: {
              selector: 'li.text-center:nth-child(1) > img:nth-child(1)',
              attr: 'src',
              convert: img => `https:${img}`
            }
          })
            .then(async ({ data, response }) => {
              if (
                data.title &&
                data.desc &&
                data.image !== 'https:' &&
                data.image
              ) {
                const project = new Project()
                project.link = req.body.link
                project.name = data.title
                project.tagline = data.desc
                project.submitter = {
                  id: req.user.id
                }
                project.image = data.image
                project.timestamp = new Date().toISOString()
                await project.save()
                res.json({ message: 'Project created!' })
                notifyStat(
                  `API: SUCCESS created PROJECT with NAME ${
                    project.name
                  }, by EMAIL ${req.user.email}`
                )
              }
            })
            .catch(err => {
              res.sendStatus(500)
            })
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
router.route('/:project_id').get(async (req, res) => {
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
      timestamp: project.timestamp,
      image: project.image,
      submitter: {
        name: `${attendee.fname} ${attendee.lname.charAt(0)}.`
      },
      id: project._id
    }
    if (req.user.role === 'admin') editedProject.upvotes = upvotes.length
    res.json(editedProject)
  } catch (e) {
    console.log(e)
    res.sendStatus(500)
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
