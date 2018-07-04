const Attendee = require('../models/attendee')
const commands = require('../../config/commands')
const Discord = require('discord.js')
const discord = require('../../config/discord')
const client = new Discord.Client()

client.login(process.env.DISCORD_TOKEN)

// Set up Discord bot
client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`)
  const game = '!help for help'
  try {
    await client.user.setActivity(game, { type: 'PLAYING' })
    console.log(`Running game: ${game}`)
  } catch (e) {
    console.error(e)
  }
  console.log(JSON.stringify(client.guilds.get(discord.server).roles));
  //notifyStat(`<@&${discord.role.dev}>: Bot is live!`)
})

client.on('guildMemberAdd', async member => {
  try {
    const attendeeDiscord = await Attendee.findOne({
      discordId: member.id
    }).exec()
    if (!attendeeDiscord) {
      member.send(
        "Welcome to Hack Chicago! Please respond with your email address to confirm you're an attendee."
      )

      const guild = client.guilds.get(discord.server)
      const guildUser = guild.member(member.id)
      notifyStat(
        `STAT: New attendee <@&${
          guildUser.user.id
        }> JOINED the server. Be ready to assist with verification.`
      )
    } else {
      await registerUser(attendeeDiscord, member.id)
    }
  } catch (e) {}
})

client.on('message', async msg => {
  // Make sure Orpheus doesn't respond to her own message
  if (msg.author === client.user) {
    return
  }
  // Check if message is in DM
  if (!msg.guild) {
    // Check if Discord user has already been authenticated
    try {
      const attendeeDiscord = await Attendee.findOne({
        discordId: msg.author.id
      }).exec()
      // Only allow unauthed accounts
      if (attendeeDiscord) {
        return
      }
      // Check for valid email address
      const attendeeEmail = msg.content.toLowerCase()
      const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      if (!emailRegex.test(attendeeEmail)) {
        msg.channel.send(
          "**Invalid email address! If you haven't yet signed up, head to https://hackchicago.io to do so!**"
        )
      }
      const attendee = await Attendee.findOne({ email: attendeeEmail }).exec()
      if (!attendee) {
        msg.channel.send('**You are not an attendee.**')
        return
      }
      // Ensure the attendee hasn't already registered before continuing
      if (!attendee.hasRegistered) {
        // Update attendee to be registered
        Attendee.update(
          { email: attendeeEmail },
          { hasRegistered: true, discordId: msg.author.id },
          async (err, raw) => {
            // if attendee data is saved, register user on server
            if (raw.ok) {
              await registerUser(attendee, msg.author.id, msg.channel)
            } else {
              msg.channel.send(
                'An error occurred, **organizers have been notified.**'
              )
              notifyStat(
                `<@&${discord.role.dev}>: ERROR: Attendee with ID ${
                  attendee.id
                } and EMAIL ${
                  attendee.email
                } could NOT update hasRegistered (true) or discordId (${
                  attendee.discordId
                }).`
              )
            }
          }
        )
      } else {
        msg.channel.send(
          'You have already registered. **Please contact an organizer for help.**'
        )
        notifyStat(
          `WARN: Attendee ${attendee.id} (${
            attendee.email
          }) is attempting to re-register.`
        )
      }
    } catch (e) {}
  } else {
    // User is in server, handle commands
    if (msg.content == 'ping') msg.channel.send('pong')

    // Check if first character is the command prefix
    const firstChar = msg.content[0]
    if (firstChar !== '!') {
      return
    }
    const command = msg.content.substring(1).toLowerCase()
    if (commands.hasOwnProperty(command)) {
      msg.channel.send(commands[command])
    } else if (command === 'organizers-confirm') {
      notifyStat(
        `<@&${discord.role.organizers}>: Help has been requested in <#${
          msg.channel.id
        }>.`
      )
      msg.channel.send('**Organizers have been NOTIFIED.**')
    } else {
      msg.channel.send("That command doesn't exist!")
    }
  }
})

process.on('uncaughtException', ex => {
  console.log(ex)
  notifyStat(
    `<@&${
      discord.role.dev
    }>: OH NOES, BOT IS CRASHING\n\nError:\n\`\`\`${ex}\`\`\``
  )
})

function notifyStat(message) {
  const guild = client.guilds.get(discord.server)
  const orgChannel = guild.channels.get(discord.channel.stat)

  orgChannel.send(message)
  console.log(`stat: ${message}`)
}

async function registerUser(attendee, id, channel) {
  const guild = client.guilds.get(discord.server)
  const guildUser = guild.member(id)

  // Setup nickname to be real name (example: John D.)
  const nickname = `${attendee.fname} ${attendee.lname[0]}.`
  try {
    await guildUser.setNickname(nickname)
    if (channel) channel.send('Part 1 complete..')
  } catch (e) {
    notifyStat(
      `<@&${discord.role.dev}>: Error with attendee <@&${
        guildUser.user.id
      }> with EMAIL ${attendee.email} while setting nickname: ${e}`
    )
  }
  try {
    await guildUser.addRole(discord.role.attendees)
    if (channel) channel.send('Part 2 complete..')
  } catch (e) {
    notifyStat(
      `<@&${discord.role.dev}>: Error with attendee <@&${
        guildUser.user.id
      }> with EMAIL ${attendee.email} while setting role: ${e}`
    )
  }

  // Handle locations
  if (attendee.state === 'Ohio') guildUser.addRole(discord.role.ohio)
  if (attendee.state === 'Illinois') guildUser.addRole(discord.role.illinois)

  if (channel) {
    channel.send(
      `**Welcome aboard, ${
        attendee.fname
      }! Please return to the Hack Chicago server!**`
    )
    notifyStat(
      `STAT: Attendee <@&${guildUser.user.id}> with ID ${
        attendee.id
      } and EMAIL ${attendee.email} has just BEEN VERIFIED!`
    )
  } else {
    console.log(`New user ${attendee.fname} has been successfully onboarded`)
    notifyStat(
      `STAT: REJOINING Attendee <@&${guildUser.user.id}> with ID ${
        attendee.id
      } and EMAIL ${attendee.email} has just BEEN RE-VERIFIED!`
    )
  }
}

module.exports.notifyStat = notifyStat
