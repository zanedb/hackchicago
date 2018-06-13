// .env variables
require('dotenv').config();

// setup discord.js
const Discord = require('discord.js');
const client = new Discord.Client();

// setup Express server
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
// configure body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// set port
const port = process.env.PORT || 3000;
// setup router
const router = express.Router();

app.get('/', function(req, res) {
  res.status(404).json({ message: '404 not found, please use /api' })
});

// middleware to use for all requests
router.use(function(req, res, next) {
  if (req.body.auth === process.env.AUTH_KEY) {
    console.log('Request received..');
    next(); // make sure we go to the next route and don't stop here
  } else {
    res.status(403).json({ message: 'Please authenticate.' });
  }
});

// accessed at http://localhost:3000/api
router.get('/', function(req, res) {
  res.json({ message: 'API loaded successfully' });
});

router.route('/attendees')
  // create an attendee (accessed at POST http://localhost:3000/api/attendees)
  .post(function(req, res) {
    let attendee = new Attendee();
    // set params from request
    attendee.fname = req.body.fname;
    attendee.lname = req.body.lname;
    attendee.email = req.body.email;

    // save and check for errors
    attendee.save(function(err) {
      if (err) res.send(err);

      res.json({ message: 'Attendee created!' });
    });
  })
  .get(function(req, res) {
    Attendee.find(function(err, attendees) {
      if (err) res.send(err);

      res.json(attendees);
    });
  });

// get/update/delete attendees by email
router.route('/attendees/email/:attendee_email')
  // get the attendee with that id (accessed at GET http://localhost:8080/api/attendees/email/:attendee_email)
  .get(function(req, res) {
    Attendee.find({ email: req.params.attendee_email }, function(err, attendee) {
      if (err) res.send(err);

      res.json(attendee);
    });
  })
  // update the attendee with this id (accessed at PUT http://localhost:8080/api/attendees/email/:attendee_email)
  .put(function(req, res) {
    // find & update attendee
    Attendee.find({ email: req.params.attendee_email }, function(err, attendee) {
      if (err) res.send(err);

      if(req.body.fname || req.body.lname || req.body.email) {
        if (req.body.fname) attendee.fname = req.body.fname;
        if (req.body.lname) attendee.lname = req.body.lname;
        if (req.body.email) attendee.email = req.body.email;

        // save the updated attendee data
        attendee.save(function(err) {
          if (err) res.send(err);

          res.json({ message: 'Attendee updated!' });
        });
      } else {
        res.status(400).json({ message: 'Attendee not updated!' });
      }
    });
  })
  .delete(function(req, res) {
    Attendee.remove({
      email: req.params.attendee_email
    }, function(err, attendee) {
      if (err)
        res.send(err);
      else
        res.json({ message: 'Successfully deleted attendee' });
    });
  });

// get/update/delete attendees by ID
router.route('/attendees/id/:attendee_id')
  // get the attendee with that id (accessed at GET http://localhost:8080/api/attendees/id/:attendee_id)
  .get(function(req, res) {
    Attendee.findById(req.params.attendee_id, function(err, attendee) {
      if (err) res.send(err);

      res.json(attendee);
    });
  })
  // update the attendee with this id (accessed at PUT http://localhost:8080/api/attendees/id/:attendee_id)
  .put(function(req, res) {
    // find & update attendee
    Attendee.findById(req.params.attendee_id, function(err, attendee) {
      if (err) res.send(err);

      if(req.body.fname || req.body.lname || req.body.email) {
        if (req.body.fname) attendee.fname = req.body.fname;
        if (req.body.lname) attendee.lname = req.body.lname;
        if (req.body.email) attendee.email = req.body.email;

        // save the updated attendee data
        attendee.save(function(err) {
          if (err) res.send(err);

          res.json({ message: 'Attendee updated!' });
        });
      } else {
        res.status(400).json({ message: 'Attendee not updated!' });
      }
    });
  })
  .delete(function(req, res) {
    Attendee.remove({
      _id: req.params.attendee_id
    }, function(err, attendee) {
      if (err) res.send(err);

      res.json({ message: 'Successfully deleted attendee' });
    });
  });

// setup Router with Express
app.use('/api', router);

// setup MongoDB
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
// load in attendee model
const Attendee = require('./app/models/attendee');

// setup discord bot on load
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  let game = '!help for help';
  client.user.setActivity(game, { type: 'PLAYING' })
    .then(console.log('Running game: '+game))
    .catch(console.error);
});

// on discord message
client.on('message', (msg) => {
  // make sure Orpheus doesn't react to her own message
  if (msg.author !== client.user) {
    // ping pong
    if(msg.content == 'ping') msg.channel.send('pong');

    // !about
    if (msg.content == '!about') msg.channel.send('**Hi, I\'m Orpheus. I\'m Hack Club & Hack Chicago\'s Robot Dinosaur!** Here are a few links about me:\n\n- My Origin Story: https://hackclub.com/workshops/orpheus\n- More Pictures of Me: https://github.com/hackclub/dinosaurs\n- Hack Club (my creators): https://hackclub.com');

    // !help
    if (msg.content == '!help') msg.channel.send('**Hi, I\'m Orpheus, the official Hack Chicago Dino! I can: **\n- Show you the full list of commands: `!commands`\n- Point you to <#456267567095611392> for mentor help\n- Point you to <#456267748658380812> for staff help\n- List our organizers: `!organizers`\n- Inform you of Hack Chicago rules: `!rules`')

    // !commands
    if (msg.content == '!commands') msg.channel.send('**Commands:**\n- `!about`: Learn more about me :robot: \n- `!help`: Get help from me :raised_back_of_hand: \n- `!commands`: This one! :point_up_2: \n- `!rules`: List the rules :straight_ruler: \n- `!organizers`: List all organizers :bust_in_silhouette:\n- `!website`: Learn about our website :computer: \n- `!social`: Check out our social media :chart_with_upwards_trend: \n- `!sponsors`: View our lovely sponsors :blush: ');

    // !rules
    if (msg.content == '!rules') msg.channel.send('**Rules:**\nYou must adhere to both the Hack Club & MLH Code of Conducts.\n\n- Hack Club Code of Conduct: https://conduct.hackclub.com/\n- MLH Code of Conduct: https://github.com/MLH/mlh-policies/blob/master/code-of-conduct.md');

    // !organizers
    if (msg.content == '!organizers') msg.channel.send('**Organizers:**\n\n- Amy C.: Marketing Team\n- Annie W.: Design Team\n- Ava S.: Marketing Team\n- Bhargav Y.: Finance Team\n- Megan C.: Operations Lead\n- Michael P.: Logistics Team\n- Mingjie J.: Marketing Lead\n- Musa K.: Marketing Team\n- Sean K.: Logistics Team\n- Victor T.: Tech Team\n- Yev B.: Tech Team\n- Zane D.: Tech Lead\n\n**And of course, our beloved Orpheus!**');

    // !website
    if (msg.content == '!website') msg.channel.send('Check out our **website** at https://hackchicago.io/.'/* Also, get **up to date alerts** for every announcement at https://hackchicago.io/live.'*/);

    // !social
    if (msg.content == '!social') msg.channel.send('**Check us out below:**\n\n- Twitter: https://twitter.com/hackchicago18\n- Instagram: https://www.instagram.com/hackchicago\n- Facebook: https://facebook.com/hackchicago\n\n**Be sure to also join our Facebook group!** https://www.facebook.com/groups/hackchicago/');

    // !sponsors
    if (msg.content == '!sponsors') msg.channel.send('**We\'d like to thank our amazing sponsors!**\n\n- McDonalds: https://www.mcdonalds.com\n- Paylocity: https://www.paylocity.com\n- Balsamiq: https://balsamiq.com\n- Flexera: https://www.flexera.com\n- Neighborhoods.com: https://www.neighborhoods.com\n- Repl.it: https://repl.it\n- Belvedere Trading: https://www.belvederetrading.com\n- Civis Analytics: https://new.civisanalytics.com\n- Tastytrade: https://www.tastytrade.com/tt/\n- Tastyworks: https://tastyworks.com/');

    // DEBUG
    console.log('message: '+msg.content)

    // check if message is in DM
    if (msg.guild == null) {
      // if so, check for valid email address
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (re.test(String(msg.content).toLowerCase())) {
        msg.channel.send('I see ya slidin into the DMs ;)');
        Attendee.find({ email: msg.content }, function(err, attendee) {
          if (err) console.log(err);

          if(attendee.length == 0) {
            msg.channel.send('You are not an attendee.');
          } else {
            msg.channel.send('Welcome aboard, '+attendee[0].fname+'!');
          }
        });
      } else {
        msg.channel.send('Invalid email address');
      }
    }
  }
});

client.on('guildMemberAdd', member => {
  member.send("Welcome to Hack Chicago! Please respond with your email address to confirm you're an attendee.");
});

// login to bot using token in .env
client.login(process.env.DISCORD_TOKEN);
// start Express server
app.listen(port);
console.log('Express server is running on port '+port)
