const express = require('express');
const Project = require('../../models/project');
const router = express.Router();

router.route('/')
  .get((req, res) => {
    Project.find((err, projects) => {
      if(err) {
        res.send(err);
      }
      else {
        res.status(200).json(projects);
      }
    });
  })
  // create a project (accessed at POST http://localhost:3000/api/v1/projects)
  .post((req, res) => {
    Project.find({ name: req.body.name }, (err, projectResult) => {
      if(projectResult.length == 0) {
        let project = new Project();
        // set params from request
        project.name = req.body.name;
        // TODO: require email to be logged in email
        // TODO: add login system
        project.submitter = { email: req.body.email, id: req.body.id };
        project.tagline = req.body.tagline;
        project.description = req.body.description;
        project.timestamp = `${new Date().getMonth()+1}/${new Date().getDate()}/${new Date().getFullYear()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;

        // save and check for errors
        project.save((err, project) => {
          if(err) {
            res.send(err);
          }
          else {
            res.json({ message: 'Project created!' });
            sendStat(`API: SUCCESS created PROJECT with NAME ${req.body.name}, by EMAIL ${project.submitter.email}`);
          }
        });
      }
      else {
        res.status(400).json({ message: 'Project with that name already exists' });
      }
    });
  });

module.exports = router;