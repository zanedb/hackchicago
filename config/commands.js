const discord = require(`./${process.env.DISCORD_CONFIG_FILE}`)

module.exports = {
  about: `
**Hi, I'm Orpheus. I'm Hack Club & Hack Chicago's Robot Dinosaur!** Here are a few links about me:

- My Origin Story: https://hackclub.com/workshops/orpheus
- More Pictures of Me: https://github.com/hackclub/dinosaurs
- Hack Club (my creators): https://hackclub.com
  `,
  commands: `
**Commands:**
- \`!about\`: Learn more about me :robot:
- \`!help\`: Get help from me :raised_back_of_hand:
- \`!commands\`: This one! :point_up_2:
- \`!rules\`: List the rules :straight_ruler:
- \`!organizers\`: Notify all organizers, use carefully :warning:
- \`!website\`: Learn about our website :computer:
- \`!social\`: Check out our social media :chart_with_upwards_trend:
  `,
  help: `
**Hi, I'm Orpheus, the official Hack Chicago Dino! I can:**
- Show you the full list of commands: \`!commands\`
- Point you to <#${discord.channel['mentor-help']}> for mentor help
- Point you to <#${discord.channel['staff-help']}> for staff help
- List our organizers: \`!organizers\`
- Inform you of Hack Chicago rules: \`!rules\`
  `,
  organizers: `
**Notify ALL organizers**
Are you **sure** you want to do this? Unnecessary/too frequent usage will result in a **ban**.
  `,
  rules: `
**Rules:**
You must adhere to both the Hack Club & MLH Code of Conducts.

- Hack Club Code of Conduct: https://conduct.hackclub.com/
- MLH Code of Conduct: https://github.com/MLH/mlh-policies/blob/master/code-of-conduct.md
  `,
  social: `
**Check us out below:**

- Twitter: https://twitter.com/hackchicago18
- Instagram: https://www.instagram.com/hackchicago
- Facebook: https://facebook.com/hackchicago

**Be sure to also join our Facebook group!** https://www.facebook.com/groups/hackchicago/
  `,
  stayawake: 'No.',
  website: 'Check out our **website** at https://hackchicago.io/.' /* Also, get **up to date alerts** for every announcement at https://hackchicago.io/live.'*/,
  '': "No command specified!"
}