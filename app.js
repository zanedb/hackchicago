require('dotenv').config()

const bodyParser = require('body-parser')
const Discord = require('discord.js')
const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')
const Attendee = require('./app/models/attendee')
const commands = require('./config/commands')
const discord = require('./config/discord')
const client = new Discord.Client()
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.redirect(302, 'https://hackchicago.io')
})

app.use('/api/v1/*', (req, res, next) => {
  if (req.get('Auth') === process.env.AUTH_KEY) {
    console.log('Request received..')
    next()
  } else {
    res.status(403).json({ message: 'Please authenticate.' })
  }
})
app.use('/api/v1/attendees', require('./app/controllers/api/v1/attendees'))
app.use('/api/v1/projects', require('./app/controllers/api/v1/projects'))
app.use('/api/v1/referrals', require('./app/controllers/api/v1/referrals'))

mongoose.connect(process.env.MONGODB_URI)

// setup discord bot on load
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
  const game = '!help for help'
  client.user
    .setActivity(game, { type: 'PLAYING' })
    .then(console.log(`Running game: ${game}`))
    .catch(console.error)
  sendStat(`<@&${discord.role.dev}>: Bot is live!`)
})

process.on('uncaughtException', ex => {
  sendStat(
    `<@&${discord.role.dev}>: OH NOES, BOT IS CRASHING\n\nError:\n\`\`\`${ex}\`\`\``
  )
})

client.on('message', msg => {
  // make sure Orpheus doesn't react to her own message
  if (msg.author === client.user) {
    return
  }
  // check if message is in DM
  if (!msg.guild) {
    // check if Discord user has already been authenticated
    Attendee.findOne({ discordId: msg.author.id }, (err, attendee_discord) => {
      // if account hasn't been authed, allow auth
      if (!attendee_discord) {
        // if so, check for valid email address
        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (emailRegex.test(msg.content.toLowerCase())) {
          const attendeeEmail = msg.content.toLowerCase()
          Attendee.findOne({ email: attendeeEmail }, (err, attendee) => {
            if (err) console.log(err)

            // check if DB returns blank data
            if (!attendee) {
              msg.channel.send('**You are not an attendee.**')
            } else {
              // otherwise, ensure the attendee hasn't already registered before continuing
              if (!attendee.hasRegistered) {
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
                        `<@&${discord.role.dev}>: ERROR: Attendee with ID ${
                          attendee.id
                        } and EMAIL ${
                          attendee.email
                        } could NOT update hasRegistered (true) or discordId (${id}).`
                      )
                    }
                  }
                )
              } else if (!attendee.hasRegistered) {
                msg.channel.send(
                  'An error occurred when fetching your attendee data. **Organizers have been notified.**'
                )
                sendStat(
                  `<@&${discord.role.dev}>: ERROR: Attendee ${
                    attendee.id
                  } (${attendee.email}) has invalid "hasRegistered" state.`
                ) // mention the @Dev role
              } else {
                msg.channel.send(
                  'You have already registered. **Please contact an organizer for help.**'
                )
                sendStat(
                  `WARN: Attendee ${attendee.id} (${
                    attendee.email
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
    if (msg.content == 'ping') msg.channel.send('pong')

    // Checks if first character is command prefix
    const firstChar = msg.content[0]
    if (firstChar !== '!') {
      return
    }
    const command = msg.content.substring(1).toLowerCase()
    if (commands.hasOwnProperty(command)) {
      msg.channel.send(commands[command])
    } else {
      msg.channel.send("That command doesn't exist!")
    }
  }
})

function sendStat(message) {
  const guild = client.guilds.get(discord.server)
  const orgChannel = guild.channels.get(discord.channel.stat)

  orgChannel.send(message)
  console.log(`stat: ${message}`)
}

function registerUser(attendee, msg) {
  // locate user
  const guild = client.guilds.get(discord.server)
  const id = msg.author.id
  const guildUser = guild.member(id)

  // setup nickname to be real name (example: John D.)
  const nickname = `${attendee.fname} ${attendee.lname[0]}.`
  // set user nickname
  guildUser
    .setNickname(nickname)
    .then(msg.channel.send('Part 1 complete..'))
    .catch(err => {
      sendStat(
        `<@&${discord.role.dev}>: Error with attendee <@&${
          guildUser.user.id
        }> with EMAIL ${attendee.email} while setting nickname: ${err}`
      )
    })
  // set to "Attendee" role
  guildUser
    .addRole(discord.role.attendee)
    .then(msg.channel.send('Part 2 complete..'))
    .catch(err => {
      sendStat(
        `<@&${discord.role.dev}>: Error with attendee <@&${
          guildUser.user.id
        }> with EMAIL ${attendee.email} while setting role: ${err}`
      )
    })

  // handle locations
  if (attendee.state === 'Ohio') guildUser.addRole(discord.role.ohio)
  if (attendee.state === 'Illinois') guildUser.addRole(discord.role.illinois)

  // welcome user
  msg.channel.send(
    `**Welcome aboard, ${
      attendee.fname
    }! Please return to the Hack Chicago server!**`
  )
  // inform organizers
  sendStat(
    `STAT: Attendee <@&${guildUser.user.id}> with ID ${
      attendee.id
    } and EMAIL ${attendee.email} has just BEEN VERIFIED!`
  )
}

function registerUserAgain(attendee, member) {
  // locate user
  const guild = client.guilds.get(discord.server)
  const id = member.id
  const guildUser = guild.member(id)

  // setup nickname to be real name (example: John D.)
  const nickname = `${attendee.fname} ${attendee.lname[0]}.`
  // set user nickname
  guildUser
    .setNickname(nickname)
    .then(console.log('Nickname set of new user'))
    .catch(err => {
      sendStat(
        `<@&${discord.role.dev}>: Error with attendee <@&${
          guildUser.user.id
        }> with EMAIL ${attendee.email} while setting nickname: ${err}`
      )
    })
  // set to "Attendee" role
  guildUser
    .addRole(discord.role.attendee)
    .then(console.log('Role set of new user'))
    .catch(err => {
      sendStat(
        `<@&${discord.role.dev}>: Error with attendee <@&${
          guildUser.user.id
        }> with EMAIL ${attendee.email} while setting role: ${err}`
      )
    })
  // handle locations
  if (attendee.state === 'Ohio') guildUser.addRole(discord.role.ohio)
  if (attendee.state === 'Illinois') guildUser.addRole(discord.role.illinois)

  // welcome user
  console.log(`New user ${attendee.fname} has been successfully onboarded`)
  // inform organizers
  sendStat(
    `STAT: REJOINING Attendee <@&${guildUser.user.id}> with ID ${
      attendee.id
    } and EMAIL ${attendee.email} has just BEEN RE-VERIFIED!`
  )
}

client.on('guildMemberAdd', member => {
  Attendee.findOne({ discordId: member.id }, (err, attendee_discord) => {
    if (!attendee_discord) {
      member.send(
        "Welcome to Hack Chicago! Please respond with your email address to confirm you're an attendee."
      )

      const guild = client.guilds.get(discord.server)
      const guildUser = guild.member(member.id)
      sendStat(
        `STAT: New attendee <@&${
          guildUser.user.id
        }> JOINED the server. Be ready to assist with verification.`
      )
    } else {
      registerUserAgain(attendee_discord, member)
    }
  })
})

client.login(process.env.DISCORD_TOKEN)

app.listen(port, () => {
  console.log(`Express server is running on port ${port}`)
})
