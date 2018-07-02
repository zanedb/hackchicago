const express = require('express');
const request = require('request');
const Attendee = require('../../../models/attendee');
const router = express.Router();

router.route('/')
  .get((req, res) => {
    Attendee.find((err, attendees) => {
      if(err) res.send(err);

      res.json(attendees);
    });
  })
  // create an attendee (accessed at POST http://localhost:3000/api/v1/attendees)
  .post((req, res) => {
    Attendee.find({ email: req.body.email }, (err, attendee) => {
      if(attendee.length == 0) {
        let attendee = new Attendee();
        // set params from request
        attendee.fname = req.body.fname;
        attendee.lname = req.body.lname;
        attendee.email = req.body.email;
        attendee.state = req.body.state;
        attendee.city = req.body.city;
        attendee.school = req.body.school;
        attendee.ref = req.body.ref;
        attendee.grade = req.body.grade;
        attendee.timestamp = req.body.timestamp;
        attendee.note = req.body.note;
        attendee.phone = req.body.phone;
        attendee.shirtSize = req.body.shirtSize;
        attendee.dietRestrictions = req.body.dietRestrictions;
        attendee.gender = req.body.gender;
        attendee.hasRegistered = false;
        attendee.isApproved = false;

        // save and check for errors
        attendee.save((err, attendee) => {
          if(err) res.send(err);

          res.json({ message: 'Attendee created!' });
          sendStat(`API: SUCCESS created attendee with EMAIL ${req.body.email}, ID ${attendee.id}`);
        });
      }
      else {
        res.status(400).json({ message: 'Attendee with that email already exists' });
      }
    });
  });

// get/update/delete attendees by email
router.route('/email/:attendee_email')
  // get the attendee with that id (accessed at GET http://localhost:3000/api/v1/attendees/email/:attendee_email)
  .get((req, res) => {
    Attendee.find({ email: req.params.attendee_email }, (err, attendee) => {
      if(err) res.send(err);

      if(attendee.length == 0) {
        res.status(400).json({ message: 'Invalid email' });
      }
      else {
        res.json(attendee);
      }
    });
  })
  // update the attendee with this id (accessed at PUT http://localhost:3000/api/v1/attendees/email/:attendee_email)
  .put((req, res) => {
    // find & update attendee
    Attendee.find({ email: req.params.attendee_email }, (err, attendee) => {
      if(err) res.send(err);

      if(req.body.fname || req.body.lname || req.body.email || req.body.state || req.body.city || req.body.school || req.body.ref || req.body.grade || req.body.timestamp || req.body.note || req.body.phone || req.body.shirtSize || req.body.dietRestrictions || req.body.gender) {
        if(req.body.fname) attendee.fname = req.body.fname;
        if(req.body.lname) attendee.lname = req.body.lname;
        if(req.body.email) attendee.email = req.body.email;
        if(req.body.state) attendee.state = req.body.state;
        if(req.body.city) attendee.city = req.body.city;
        if(req.body.school) attendee.school = req.body.school;
        if(req.body.ref) attendee.ref = req.body.ref;
        if(req.body.grade) attendee.grade = req.body.grade;
        if(req.body.timestamp) attendee.timestamp = req.body.timestamp;
        if(req.body.note) attendee.note = req.body.note;
        if(req.body.phone) attendee.phone = req.body.phone;
        if(req.body.shirtSize) attendee.shirtSize = req.body.shirtSize;
        if(req.body.dietRestrictions) attendee.dietRestrictions = req.body.dietRestrictions;
        if(req.body.gender) attendee.gender = req.body.gender;

        // save the updated attendee data
        attendee.save(err => {
          if(err) res.send(err);

          res.json({ message: 'Attendee updated!' });
          sendStat(`API: SUCCESS updated attendee by EMAIL ${req.params.attendee_email}`);
        });
      }
      else {
        res.status(400).json({ message: 'Attendee not updated!' });
      }
    });
  })
  .delete((req, res) => {
    Attendee.find({ email: req.params.attendee_email }, (err, attendee) => {
      if(attendee.length == 0) {
        res.status(400).json({ message: 'Invalid attendee' });
      }
      else {
        Attendee.remove({
          email: req.params.attendee_email
        }, (err, deleted_attendee) => {
          if(err) {
            res.send(err);
          }
          else {
            res.json({ message: 'Successfully deleted attendee' });
            sendStat(`API: SUCCESS deleted attendee by EMAIL ${req.params.attendee_email}, ID ${attendee[0].id}`);
          }
        });
      }
    });
  });

// get/update/delete attendees by ID
router.route('/id/:attendee_id')
  // get the attendee with that id (accessed at GET http://localhost:3000/api/v1/attendees/id/:attendee_id)
  .get((req, res) => {
    Attendee.findById(req.params.attendee_id, (err, attendee) => {
      if(err) res.send(err);

      res.json(attendee);
    });
  })
  // update the attendee with this id (accessed at PUT http://localhost:3000/api/v1/attendees/id/:attendee_id)
  .put((req, res) => {
    // find & update attendee
    Attendee.findById(req.params.attendee_id, (err, attendee) => {
      if(err) res.send(err);

      if(req.body.fname || req.body.lname || req.body.email || req.body.state || req.body.city || req.body.school || req.body.ref || req.body.grade || req.body.timestamp || req.body.note || req.body.phone || req.body.shirtSize || req.body.dietRestrictions || req.body.gender) {
        if(req.body.fname) attendee.fname = req.body.fname;
        if(req.body.lname) attendee.lname = req.body.lname;
        if(req.body.email) attendee.email = req.body.email;
        if(req.body.state) attendee.state = req.body.state;
        if(req.body.city) attendee.city = req.body.city;
        if(req.body.school) attendee.school = req.body.school;
        if(req.body.ref) attendee.ref = req.body.ref;
        if(req.body.grade) attendee.grade = req.body.grade;
        if(req.body.timestamp) attendee.timestamp = req.body.timestamp;
        if(req.body.note) attendee.note = req.body.note;
        if(req.body.phone) attendee.phone = req.body.phone;
        if(req.body.shirtSize) attendee.shirtSize = req.body.shirtSize;
        if(req.body.dietRestrictions) attendee.dietRestrictions = req.body.dietRestrictions;
        if(req.body.gender) attendee.gender = req.body.gender;

        // save the updated attendee data
        attendee.save(err => {
          if(err) res.send(err);

          res.json({ message: 'Attendee updated!' });
          sendStat(`API: SUCCESS updated attendee with ID ${req.params.attendee_id}`);
        });
      }
      else {
        res.status(400).json({ message: 'Attendee not updated!' });
      }
    });
  })
  .delete((req, res) => {
    Attendee.remove({
      _id: req.params.attendee_id
    }, (err, attendee) => {
      if(err) res.send(err);

      sendStat(`API: Successfully deleted attendee by ID ${req.params.attendee_id}`);
      res.json({ message: 'Successfully deleted attendee' });
    });
  });

// endpoint to approve attendees
router.route('/id/:attendee_id/approve')
  // accessed at GET http://localhost:3000/api/v1/attendees/id/:attendee_id/approve
  .post((req, res) => {
    Attendee.findById(req.params.attendee_id, (err, attendee) => {
      request.post(process.env.MAILCHIMP_APPROVAL_URL, {
          json: { email_address: attendee.email },
          auth: {
            user: process.env.MAILCHIMP_APPROVAL_USERNAME,
            pass: process.env.MAILCHIMP_APPROVAL_PASSWORD
          }
        },
        (error, response, body) => {
          if(response.statusCode !== 204) {
            sendStat(`Error while approving attendee:\n\n\`\`\`${body.detail}\`\`\``);
            res.status(400).json({ message: body.detail });
          }
          else {
            attendee.isApproved = true;

            // save the updated attendee data
            attendee.save(err => {
              if(error) {
                res.status(500).send(err);
              }
              else {
                res.status(200).json({ message: 'Attendee approved!' });
                sendStat(`API: SUCCESS approved attendee with ID ${req.params.attendee_id} and EMAIL ${attendee.email}`);
              }
            });
          }
        }
      );
    });
  });

module.exports = router;