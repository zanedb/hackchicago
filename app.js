// .env variables
require('dotenv').config();

const request = require('request');

// setup discord.js
const Discord = require('discord.js');
const client = new Discord.Client();

// setup Express server
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
// configure body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// configure cors
app.use(cors());
// set port
const port = process.env.PORT || 3000;
// setup router
const router = express.Router();

app.get('/', function(req, res) {
  res.writeHead(302, {'Location': 'https://hackchicago.io'});
  return res.end();
});

app.get('/api', function(req, res) {
  res.status(404).json({ message: 'Please use /api/v1' });
});

app.get('/v1', function(req, res) {
  res.status(404).json({ message: 'Please use /api/v1' });
});

// middleware to use for all requests
router.use(function(req, res, next) {
  // if header "Auth" matches auth variable (from .env)
  if (req.get('Auth') === process.env.AUTH_KEY) {
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
    Attendee.find({ email: req.body.email }, function(err, attendee) {
      if (attendee.length == 0) {
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
        attendee.save(function(err, attendee) {
          if (err) res.send(err);

          res.json({ message: 'Attendee created!' });
          sendStat('API: SUCCESS created attendee with EMAIL '+req.body.email+', ID '+attendee.id);
        });
      } else {
        res.status(400).json({ message: 'Attendee with that email already exists' });
      }
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

      if (attendee.length == 0) {
        res.status(400).json({ message: 'Invalid email' })
      } else {
        res.json(attendee);
      }
    });
  })
  // update the attendee with this id (accessed at PUT http://localhost:8080/api/attendees/email/:attendee_email)
  .put(function(req, res) {
    // find & update attendee
    Attendee.find({ email: req.params.attendee_email }, function(err, attendee) {
      if (err) res.send(err);

      if(req.body.fname || req.body.lname || req.body.email || req.body.state || req.body.city || req.body.school || req.body.ref || req.body.grade || req.body.timestamp || req.body.note || req.body.phone || req.body.shirtSize || req.body.dietRestrictions || req.body.gender) {
        if (req.body.fname) attendee.fname = req.body.fname;
        if (req.body.lname) attendee.lname = req.body.lname;
        if (req.body.email) attendee.email = req.body.email;
        if (req.body.state) attendee.state = req.body.state;
        if (req.body.city) attendee.city = req.body.city;
        if (req.body.school) attendee.school = req.body.school;
        if (req.body.ref) attendee.ref = req.body.ref;
        if (req.body.grade) attendee.grade = req.body.grade;
        if (req.body.timestamp) attendee.timestamp = req.body.timestamp;
        if (req.body.note) attendee.note = req.body.note;
        if (req.body.phone) attendee.phone = req.body.phone;
        if (req.body.shirtSize) attendee.shirtSize = req.body.shirtSize;
        if (req.body.dietRestrictions) attendee.dietRestrictions = req.body.dietRestrictions;
        if (req.body.gender) attendee.gender = req.body.gender;

        // save the updated attendee data
        attendee.save(function(err) {
          if (err) res.send(err);

          res.json({ message: 'Attendee updated!' });
          sendStat('API: SUCCESS updated attendee by EMAIL '+req.params.attendee_email);
        });
      } else {
        res.status(400).json({ message: 'Attendee not updated!' });
      }
    });
  })
  .delete(function(req, res) {
    Attendee.find({ email: req.params.attendee_email }, function(err, attendee) {
      if (attendee.length == 0) {
        res.status(400).json({ message: 'Invalid attendee' });
      } else {
        Attendee.remove({
          email: req.params.attendee_email
        }, function(err, deleted_attendee) {
          if (err) {
            res.send(err);
          } else {
            res.json({ message: 'Successfully deleted attendee' });
            sendStat('API: SUCCESS deleted attendee by EMAIL '+req.params.attendee_email+', ID '+attendee[0].id);
          }
        });
      }
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

      if(req.body.fname || req.body.lname || req.body.email || req.body.state || req.body.city || req.body.school || req.body.ref || req.body.grade || req.body.timestamp || req.body.note || req.body.phone || req.body.shirtSize || req.body.dietRestrictions || req.body.gender) {
        if (req.body.fname) attendee.fname = req.body.fname;
        if (req.body.lname) attendee.lname = req.body.lname;
        if (req.body.email) attendee.email = req.body.email;
        if (req.body.state) attendee.state = req.body.state;
        if (req.body.city) attendee.city = req.body.city;
        if (req.body.school) attendee.school = req.body.school;
        if (req.body.ref) attendee.ref = req.body.ref;
        if (req.body.grade) attendee.grade = req.body.grade;
        if (req.body.timestamp) attendee.timestamp = req.body.timestamp;
        if (req.body.note) attendee.note = req.body.note;
        if (req.body.phone) attendee.phone = req.body.phone;
        if (req.body.shirtSize) attendee.shirtSize = req.body.shirtSize;
        if (req.body.dietRestrictions) attendee.dietRestrictions = req.body.dietRestrictions;
        if (req.body.gender) attendee.gender = req.body.gender;

        // save the updated attendee data
        attendee.save(function(err) {
          if (err) res.send(err);

          res.json({ message: 'Attendee updated!' });
          sendStat('API: SUCCESS updated attendee with ID '+req.params.attendee_id);
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

      sendStat('API: Successfully deleted attendee by ID '+req.params.attendee_id);
      res.json({ message: 'Successfully deleted attendee' });
    });
  });

// endpoint to approve attendees
router.route('/attendees/id/:attendee_id/approve')
  // accessed at GET http://localhost:3000/api/v1/attendees/id/:attendee_id/approve
  .post(function(req, res) {
    Attendee.findById(req.params.attendee_id, function(err, attendee) {
      request.post(process.env.MAILCHIMP_APPROVAL_URL,
        { 
          json: { email_address: attendee.email },
          auth: { 
            user: process.env.MAILCHIMP_APPROVAL_USERNAME,
            pass: process.env.MAILCHIMP_APPROVAL_PASSWORD 
          } 
        },
        function(err, res, body) {
          if(body.status !== 200) {
            sendStat(`<@&456539994719518750>: ERROR WHILE APPROVING ATTENDEE\n\n\`\`\`${body}\`\`\``);
          } else {
            attendee.isApproved = true;

            // save the updated attendee data
            attendee.save(function(err) {
              if (err) {
                res.status(500).send(err);
              } else {
                res.status(200).json({ message: 'Attendee approved!' });
                sendStat(`API: SUCCESS approved attendee with ID ${req.params.attendee_id} and EMAIL ${attendee.email}`);
              }
            });
          }
        }
      );
    });
  });

router.route('/referrals')
  // accessed at GET http://localhost:8080/api/referrals 
  .get(function(req, res) {
    // do stuff
  });

// setup Router with Express
app.use('/api/v1', router);

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
  sendStat('<@&456539994719518750>: Bot is live!');
});

// handle system error
process.on('uncaughtException', function(ex) {
  sendStat('<@&456539994719518750>: OH NOES, BOT IS CRASHING\n\nError:\n```'+ex+'```');
});

// on discord message
client.on('message', (msg) => {
  // make sure Orpheus doesn't react to her own message
  if (msg.author !== client.user) {
    // check if message is in DM
    if (msg.guild == null) {
      // check if Discord user has already been authenticated
      Attendee.find({ discordId: msg.author.id }, function(err, attendee_discord) {
        // if account hasn't been authed, allow auth
        if (attendee_discord.length == 0) {
          // if so, check for valid email address
          var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if (re.test(String(msg.content).toLowerCase())) {
            let attendeeEmail = msg.content.toLowerCase();
            Attendee.find({ email: attendeeEmail }, function(err, attendee) {
              if (err) console.log(err);

              // check if DB returns blank data
              if(attendee.length == 0) {
                msg.channel.send('**You are not an attendee.**');
              } else {
                // otherwise, ensure the attendee hasn't already registered before continuing
                if(attendee[0].hasRegistered == false) {
                  // update attendee to be registered (hasRegistered = true)
                  Attendee.update({ email: attendeeEmail }, { hasRegistered: true, discordId: msg.author.id }, function (err, raw) {
                    // if attendee data is saved, register user on server
                    if (raw.ok = 1) {
                      registerUser(attendee, msg);
                    } else {
                      msg.channel.send('An error occurred, **organizers have been notified.**');
                      sendStat('<@&456539994719518750>: ERROR: Attendee with ID '+attendee[0].id+' and EMAIL '+attendee[0].email+' could NOT update hasRegistered (true) or discordId ('+id+').')
                    }
                  });
                } else if (attendee[0].hasRegistered == null) {
                  msg.channel.send('An error occurred when fetching your attendee data. **Organizers have been notified.**')
                  sendStat('<@&456539994719518750>: ERROR: Attendee '+attendee[0].id+' ('+attendee[0].email+') has invalid "hasRegistered" state.'); // mention the @Dev role
                } else {
                  msg.channel.send('You have already registered. **Please contact an organizer for help.**');
                  sendStat('WARN: Attendee '+attendee[0].id+' ('+attendee[0].email+') is attempting to re-register.');
                }
              }
            });
          } else {
            msg.channel.send('**Invalid email address! If you haven\'t yet signed up, head to https://hackchicago.io to do so!**');
          }
        } else {
          // discord account is already registered, orpheus should _not_ respond to messages
          //msg.channel.send('This Discord account is already registered.');
        }
      });
    } else {
      // IS IN SERVER, SEND COMMANDS
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

      // !stayawake
      if (msg.content == '!stayawake') msg.channel.send('no');
    }
  }
});

function sendStat(message) {
  let guild = client.guilds.get('455396418199486465'); // hack chicago server ID
  let orgChannel = guild.channels.get('456541536658784266'); // #stat channel ID

  orgChannel.send(message);
  console.log('stat: '+message);
}

function registerUser(attendee, msg) {
  // locate user
  let guild = client.guilds.get('455396418199486465') // hack chicago server (shouldn't be hardcoded but oh well..)
  let id = msg.author.id;
  let guildUser = guild.member(id)

  // setup nickname to be real name (example: John D.)
  let nickname = attendee[0].fname+' '+(attendee[0].lname).charAt(0)+'.';
  // set user nickname
  guildUser.setNickname(nickname)
    .then(msg.channel.send('Part 1 complete..'))
    .catch(function(error) { sendStat('<@&456539994719518750>: Error with attendee <@'+guildUser.user.id+'> with EMAIL '+attendee[0].email+' while setting nickname: '+error); });
  // set to "Attendee" role
  guildUser.addRole('455402838210773012')
    .then(msg.channel.send('Part 2 complete..'))
    .catch(function(error) { sendStat('<@&456539994719518750>: Error with attendee <@'+guildUser.user.id+'> with EMAIL '+attendee[0].email+' while setting role: '+error); });

  // handle locations
  if (attendee[0].state === 'Ohio') guildUser.addRole('456228521992519700');
  if (attendee[0].state === 'Illinois') guildUser.addRole('456228742386155520');

  // welcome user
  msg.channel.send('**Welcome aboard, '+attendee[0].fname+'! Please return to the Hack Chicago server!**');
  // inform organizers
  sendStat('STAT: Attendee <@'+guildUser.user.id+'> with ID '+attendee[0].id+' and EMAIL '+attendee[0].email+' has just BEEN VERIFIED!');
}

function registerUserAgain(attendee, member) {
  // locate user
  let guild = client.guilds.get('455396418199486465') // hack chicago server (shouldn't be hardcoded but oh well..)
  let id = member.id;
  let guildUser = guild.member(id)

  // setup nickname to be real name (example: John D.)
  let nickname = attendee[0].fname+' '+(attendee[0].lname).charAt(0)+'.';
  // set user nickname
  guildUser.setNickname(nickname)
    .then(console.log('Nickname set of new user'))
    .catch(function(error) { sendStat('<@&456539994719518750>: Error with attendee <@'+guildUser.user.id+'> with EMAIL '+attendee[0].email+' while setting nickname: '+error); });
  // set to "Attendee" role
  guildUser.addRole('455402838210773012')
    .then(console.log('Role set of new user'))
    .catch(function(error) { sendStat('<@&456539994719518750>: Error with attendee <@'+guildUser.user.id+'> with EMAIL '+attendee[0].email+' while setting role: '+error); });

  // handle locations
  if (attendee[0].state === 'Ohio') guildUser.addRole('456228521992519700');
  if (attendee[0].state === 'Illinois') guildUser.addRole('456228742386155520');

  // welcome user
  console.log('New user '+attendee[0].fname+' has been successfully onboarded');
  // inform organizers
  sendStat('STAT: REJOINING Attendee <@'+guildUser.user.id+'> with ID '+attendee[0].id+' and EMAIL '+attendee[0].email+' has just BEEN RE-VERIFIED!');
}

client.on('guildMemberAdd', member => {
  Attendee.find({ discordId: member.id }, function(err, attendee_discord) {
    if (attendee_discord.length == 0) {
      member.send("Welcome to Hack Chicago! Please respond with your email address to confirm you're an attendee.");

      let guild = client.guilds.get('455396418199486465') // hack chicago server (shouldn't be hardcoded but oh well..)
      let guildUser = guild.member(member.id);
      sendStat('STAT: New attendee <@'+guildUser.user.id+'> JOINED the server. Be ready to assist with verification.')
    } else {
      registerUserAgain(attendee_discord, member)
    }
  });
});

// login to bot using token in .env
client.login(process.env.DISCORD_TOKEN);
// start Express server
app.listen(port);
console.log('Express server is running on port '+port)
