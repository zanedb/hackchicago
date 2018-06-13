// .env variables
require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  let game = '!help for help';
  client.user.setActivity(game, { type: 'PLAYING' })
    .then(console.log('Running: '+game))
    .catch(console.error);
});

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
        msg.channel.send('Processing..');
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
client.login(process.env.TOKEN);
