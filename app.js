// .env variables
require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (msg) => {
  // ping pong
  if(msg.content == 'ping') {
    msg.channel.send('pong');
  }

  // help
  if(msg.content == '!help') {
    msg.channel.send('**Hi, I\'m Orpheus, the official Hack Chicago Dino! I can: **\n- Show you the full list of commands: `!commands`\n- Point you to <#456267567095611392> for mentor help\n- Point you to <#456267748658380812> for staff help\n- List our organizers: `!organizers`\n- Inform you of Hack Chicago rules: `!rules`')
  }

  // DEBUG
  //console.log('message: '+msg.content)
});

// login to bot using token in .env
client.login(process.env.TOKEN);
