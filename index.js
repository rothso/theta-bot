const dotenv = require('dotenv');
const fs = require('fs');
const http = require('http');
const os = require('os');
const util = require('util');
const client = require('./lib/discord.js');
const tldr = require('./lib/tldr');

// Import roleassign behavior
require('./scripts/roleassign.js');

const PORT = 3000;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (msg) => {
  let match;
  if (msg.content.toLowerCase() === 'ping') {
    msg.reply('pong!');
  } else if (msg.content.toLowerCase() === 'marco') {
    msg.reply('polo!');
    // eslint-disable-next-line no-cond-assign
  } else if (match = msg.content.match(/if (she|he|\w+) breathe(s)?/i)) {
    const noun = match[1];
    if (noun === 'he' || noun === 'she') {
      msg.channel.send(`... ${noun} a bot.`);
    } else {
      msg.channel.send('I\'m only a bot, I can\'t tell gender :(');
    }
    // eslint-disable-next-line no-cond-assign
  } else if (match = msg.content.match(/^\$\s?man ([\w\s-]+)$/i)) {
    tldr.getEmbed(match[1])
      .then((embed) => msg.channel.send(embed))
      .catch((error) => console.log(error));
  } else if (msg.content.toLowerCase() === '$ status') {
    let icon;
    if (process.env.HOSTNAME) {
      icon = 'https://enricoteterra.com/content/images/2020/01/Google-Cloud-icon.png';
    } else if (os.platform() === 'linux') {
      icon = 'https://cdn.discordapp.com/attachments/489175239830536206/579742025604268058/linux.png';
    }

    // Get the OS name for the status message
    const readFile = util.promisify(fs.readFile);
    const buf = await readFile('/etc/os-release');
    const { PRETTY_NAME } = dotenv.parse(buf);

    msg.channel.send({
      embed: {
        color: 38536,
        description: `Hello from ${PRETTY_NAME} :wave:`,
        fields: [
          { name: 'Memory', value: `${((os.freemem() / os.totalmem()) * 100).toFixed(2)}%`, inline: true },
          { name: 'Uptime', value: new Date(1000 * process.uptime()).toISOString().substr(11, 8), inline: true },
          { name: 'Build', value: process.env.GIT_COMMIT_SHA.substr(0, 7), inline: true }
        ],
        footer: {
          ...(icon ? { icon_url: icon } : {}),
          text: new Date().toLocaleString(),
        },
      },
    });
  }
});

const getDefaultChannel = (guild) => {
  const { channels } = guild;
  const channelID = channels.find((channel) => channel.type === 'text').id;
  return client.channels.get(guild.systemChannelID || channelID);
};

client.on('guildCreate', (guild) => {
  getDefaultChannel(guild).send('Hello world!');
});

client.on('guildMemberAdd', (member) => {
  const message = `✨ **Welcome to Computer Science Royals, ${member.user.username}**\nWe're a student-run community of CS, IT, IS, and ISc students at UNF. If you get stuck on a project or have any questions, both in or out of class, feel free to ask around in <#456241057966063639>, <#546219353092259870>, and the Office Hours channels. **Please change your nickname to your first name** and list any classes you're taking in <#532062406252429312>. Make yourself at home, and thanks for joining! <:swoop:593878676219887627>`;
  getDefaultChannel(member.guild).send(message);
});

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(PORT);
