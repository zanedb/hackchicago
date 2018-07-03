// .env variables
require('dotenv').config()

// setup discord.js
const Discord = require('discord.js')
const client = new Discord.Client()

// setup Express server
const express = require('express')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
// configure body-parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
// configure cors
app.use(cors())
// set port
const port = process.env.PORT || 3000
// setup router
const router = express.Router()

app.get('/', (req, res) => {
  res.writeHead(302, { Location: 'https://hackchicago.io' })
  return res.end()
})

// middleware to use for all requests
router.use((req, res, next) => {
  // if header "Auth" matches auth variable (from .env)
  if (req.get('Auth') === process.env.AUTH_KEY) {
    console.log('Request received..')
    next() // make sure we go to the next route and don't stop here
  } else {
    res.status(403).json({ message: 'Please authenticate.' })
  }
})

// accessed at http://localhost:3000/api/v1
router.get('/', (req, res) => {
  res.json({ message: 'API loaded successfully' })
})

// setup Router with Express
app.use('/api/v1/attendees', require('./app/controllers/api/v1/attendees'))
app.use('/api/v1/projects', require('./app/controllers/api/v1/projects'))
app.use('/api/v1/referrals', require('./app/controllers/api/v1/referrals'))

// setup MongoDB
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URI)
// load in models
const Attendee = require('./app/models/attendee')

// setup discord bot on load
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
  const game = '!help for help'
  client.user
    .setActivity(game, { type: 'PLAYING' })
    .then(console.log(`Running game: ${game}`))
    .catch(console.error)
  sendStat('<@&456539994719518750>: Bot is live!')
})

// handle system error
process.on('uncaughtException', ex => {
  sendStat(
    `<@&456539994719518750>: OH NOES, BOT IS CRASHING\n\nError:\n\`\`\`${ex}\`\`\``
  )
})

// on discord message
client.on('message', msg => {
  // make sure Orpheus doesn't react to her own message
  if (msg.author !== client.user) {
    // check if message is in DM
    if (msg.guild == null) {
      // check if Discord user has already been authenticated
      Attendee.find({ discordId: msg.author.id }, (err, attendee_discord) => {
        // if account hasn't been authed, allow auth
        if (attendee_discord.length == 0) {
          // if so, check for valid email address
          const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          if (emailRegex.test(msg.content.toLowerCase())) {
            const attendeeEmail = msg.content.toLowerCase()
            Attendee.find({ email: attendeeEmail }, (err, attendee) => {
              if (err) console.log(err)

              // check if DB returns blank data
              if (attendee.length == 0) {
                msg.channel.send('**You are not an attendee.**')
              } else {
                // otherwise, ensure the attendee hasn't already registered before continuing
                if (attendee[0].hasRegistered == false) {
                  // update attendee to be registered (hasRegistered = true)
                  Attendee.update(
                    { email: attendeeEmail },
                    { hasRegistered: true, discordId: msg.author.id },
                    (err, raw) => {
                      // if attendee data is saved, register user on server
                      if ((raw.ok = 1)) {
                        registerUser(attendee, msg)
                      } else {
                        msg.channel.send(
                          'An error occurred, **organizers have been notified.**'
                        )
                        sendStat(
                          `<@&456539994719518750>: ERROR: Attendee with ID ${
                            attendee[0].id
                          } and EMAIL ${
                            attendee[0].email
                          } could NOT update hasRegistered (true) or discordId (${id}).`
                        )
                      }
                    }
                  )
                } else if (attendee[0].hasRegistered == null) {
                  msg.channel.send(
                    'An error occurred when fetching your attendee data. **Organizers have been notified.**'
                  )
                  sendStat(
                    `<@&456539994719518750>: ERROR: Attendee ${
                      attendee[0].id
                    } (${attendee[0].email}) has invalid "hasRegistered" state.`
                  ) // mention the @Dev role
                } else {
                  msg.channel.send(
                    'You have already registered. **Please contact an organizer for help.**'
                  )
                  sendStat(
                    `WARN: Attendee ${attendee[0].id} (${
                      attendee[0].email
                    }) is attempting to re-register.`
                  )
                }
              }
            })
          } else {
            msg.channel.send(
              "**Invalid email address! If you haven't yet signed up, head to https://hackchicago.io to do so!**"
            )
          }
        } else {
          // discord account is already registered, orpheus should _not_ respond to messages
          //msg.channel.send('This Discord account is already registered.');
        }
      })
    } else {
      // IS IN SERVER, SEND COMMANDS
      // ping pong
      if (msg.content == 'ping') msg.channel.send('pong')

      // Checks if first character is command prefix
      const firstChar = msg.content[0]
      if (firstChar !== '!') {
        return
      }
      const command = msg.content.substring(1).toLowerCase()
      switch (command) {
        case 'about':
          msg.channel.send(
            "**Hi, I'm Orpheus. I'm Hack Club & Hack Chicago's Robot Dinosaur!** Here are a few links about me:\n\n- My Origin Story: https://hackclub.com/workshops/orpheus\n- More Pictures of Me: https://github.com/hackclub/dinosaurs\n- Hack Club (my creators): https://hackclub.com"
          )
          break
        case 'commands':
          msg.channel.send(
            '**Commands:**\n- `!about`: Learn more about me :robot: \n- `!help`: Get help from me :raised_back_of_hand: \n- `!commands`: This one! :point_up_2: \n- `!rules`: List the rules :straight_ruler: \n- `!organizers`: List all organizers :bust_in_silhouette:\n- `!website`: Learn about our website :computer: \n- `!social`: Check out our social media :chart_with_upwards_trend: \n- `!sponsors`: View our lovely sponsors :blush: '
          )
          break
        case 'help':
          msg.channel.send(
            "**Hi, I'm Orpheus, the official Hack Chicago Dino! I can: **\n- Show you the full list of commands: `!commands`\n- Point you to <#456267567095611392> for mentor help\n- Point you to <#456267748658380812> for staff help\n- List our organizers: `!organizers`\n- Inform you of Hack Chicago rules: `!rules`"
          )
          break
        case 'organizers':
          msg.channel.send(
            '**Organizers:**\n\n- Amy C.: Marketing Team\n- Annie W.: Design Team\n- Ava S.: Marketing Team\n- Bhargav Y.: Finance Team\n- Megan C.: Operations Lead\n- Michael P.: Logistics Team\n- Mingjie J.: Marketing Lead\n- Musa K.: Marketing Team\n- Sean K.: Logistics Team\n- Victor T.: Tech Team\n- Yev B.: Tech Team\n- Zane D.: Tech Lead\n\n**And of course, our beloved Orpheus!**'
          )
          break
        case 'rules':
          msg.channel.send(
            '**Rules:**\nYou must adhere to both the Hack Club & MLH Code of Conducts.\n\n- Hack Club Code of Conduct: https://conduct.hackclub.com/\n- MLH Code of Conduct: https://github.com/MLH/mlh-policies/blob/master/code-of-conduct.md'
          )
          break
        case 'social':
          msg.channel.send(
            '**Check us out below:**\n\n- Twitter: https://twitter.com/hackchicago18\n- Instagram: https://www.instagram.com/hackchicago\n- Facebook: https://facebook.com/hackchicago\n\n**Be sure to also join our Facebook group!** https://www.facebook.com/groups/hackchicago/'
          )
          break
        case 'sponsors':
          msg.channel.send(
            "**We'd like to thank our amazing sponsors!**\n\n- McDonalds: https://www.mcdonalds.com\n- Paylocity: https://www.paylocity.com\n- Balsamiq: https://balsamiq.com\n- Flexera: https://www.flexera.com\n- Neighborhoods.com: https://www.neighborhoods.com\n- Repl.it: https://repl.it\n- Belvedere Trading: https://www.belvederetrading.com\n- Civis Analytics: https://new.civisanalytics.com\n- Tastytrade: https://www.tastytrade.com/tt/\n- Tastyworks: https://tastyworks.com/"
          )
          break
        case 'stayawake':
          msg.channel.send('no')
          break
        case 'website':
          msg.channel.send(
            'Check out our **website** at https://hackchicago.io/.' /* Also, get **up to date alerts** for every announcement at https://hackchicago.io/live.'*/
          )
          break
        case '':
          msg.channel.send('No command specified!')
        default:
          msg.channel.send("That command doesn't exist!")
          break
      }
    }
  }
})

function sendStat(message) {
  const guild = client.guilds.get('455396418199486465') // hack chicago server ID
  const orgChannel = guild.channels.get('456541536658784266') // #stat channel ID

  orgChannel.send(message)
  console.log(`stat: ${message}`)
}

function registerUser(attendee, msg) {
  // locate user
  const guild = client.guilds.get('455396418199486465') // hack chicago server (shouldn't be hardcoded but oh well..)
  const id = msg.author.id
  const guildUser = guild.member(id)

  // setup nickname to be real name (example: John D.)
  const nickname = `${attendee[0].fname} ${attendee[0].lname[0]}.`
  // set user nickname
  guildUser
    .setNickname(nickname)
    .then(msg.channel.send('Part 1 complete..'))
    .catch(err => {
      sendStat(
        `<@&456539994719518750>: Error with attendee <@${
          guildUser.user.id
        }> with EMAIL ${attendee[0].email} while setting nickname: ${err}`
      )
    })
  // set to "Attendee" role
  guildUser
    .addRole('455402838210773012')
    .then(msg.channel.send('Part 2 complete..'))
    .catch(err => {
      sendStat(
        `<@&456539994719518750>: Error with attendee <@${
          guildUser.user.id
        }> with EMAIL ${attendee[0].email} while setting role: ${err}`
      )
    })

  // handle locations
  if (attendee[0].state === 'Ohio') guildUser.addRole('456228521992519700')
  if (attendee[0].state === 'Illinois') guildUser.addRole('456228742386155520')

  // welcome user
  msg.channel.send(
    `**Welcome aboard, ${
      attendee[0].fname
    }! Please return to the Hack Chicago server!**`
  )
  // inform organizers
  sendStat(
    `STAT: Attendee <@${guildUser.user.id}> with ID ${
      attendee[0].id
    } and EMAIL ${attendee[0].email} has just BEEN VERIFIED!`
  )
}

function registerUserAgain(attendee, member) {
  // locate user
  const guild = client.guilds.get('455396418199486465') // hack chicago server (shouldn't be hardcoded but oh well..)
  const id = member.id
  const guildUser = guild.member(id)

  // setup nickname to be real name (example: John D.)
  const nickname = `${attendee[0].fname} ${attendee[0].lname[0]}.`
  // set user nickname
  guildUser
    .setNickname(nickname)
    .then(console.log('Nickname set of new user'))
    .catch(err => {
      sendStat(
        `<@&456539994719518750>: Error with attendee <@${
          guildUser.user.id
        }> with EMAIL ${attendee[0].email} while setting nickname: ${err}`
      )
    })
  // set to "Attendee" role
  guildUser
    .addRole('455402838210773012')
    .then(console.log('Role set of new user'))
    .catch(err => {
      sendStat(
        `<@&456539994719518750>: Error with attendee <@${
          guildUser.user.id
        }> with EMAIL ${attendee[0].email} while setting role: ${err}`
      )
    })
  // handle locations
  if (attendee[0].state === 'Ohio') guildUser.addRole('456228521992519700')
  if (attendee[0].state === 'Illinois') guildUser.addRole('456228742386155520')

  // welcome user
  console.log(`New user ${attendee[0].fname} has been successfully onboarded`)
  // inform organizers
  sendStat(
    `STAT: REJOINING Attendee <@${guildUser.user.id}> with ID ${
      attendee[0].id
    } and EMAIL ${attendee[0].email} has just BEEN RE-VERIFIED!`
  )
}

client.on('guildMemberAdd', member => {
  Attendee.find({ discordId: member.id }, (err, attendee_discord) => {
    if (attendee_discord.length == 0) {
      member.send(
        "Welcome to Hack Chicago! Please respond with your email address to confirm you're an attendee."
      )

      const guild = client.guilds.get('455396418199486465') // hack chicago server (shouldn't be hardcoded but oh well..)
      const guildUser = guild.member(member.id)
      sendStat(
        `STAT: New attendee <@${
          guildUser.user.id
        }> JOINED the server. Be ready to assist with verification.`
      )
    } else {
      registerUserAgain(attendee_discord, member)
    }
  })
})

// login to bot using token in .env
client.login(process.env.DISCORD_TOKEN)
// start Express server
app.listen(port, () => {
  console.log(`Express server is running on port ${port}`)
})
