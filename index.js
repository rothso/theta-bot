const Discord = require('discord.js');
const http = require('http');
const dotenv = require('dotenv');
const tldr = require('./tldr');

dotenv.config();

const { TOKEN } = process.env;
const PORT = 3000;

const client = new Discord.Client();
client.login(TOKEN);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (msg) => {
  let match;
  if (msg.content.toLowerCase() === 'ping') {
    msg.reply('pong!');
  } else if (msg.content.toLowerCase() === 'marco') {
    msg.reply('polo!');
  } else if (match = msg.content.match(/if (she|he|\w+) breathe(s)?/i)) {
    const noun = match[1];
    if (noun === 'he' || noun === 'she') {
      msg.channel.send(`... ${noun} a bot.`);
    } else {
      msg.channel.send('I\'m only a bot, I can\'t tell gender :(');
    }
  } else if (match = msg.content.match(/^\$\s?man ([\w\s-]+)$/i)) {
    tldr.getEmbed(match[1])
      .then(embed => msg.channel.send(embed))
      .catch(error => console.log(error));
  }
});

const getDefaultChannel = (guild) => {
  const { channels } = guild;
  const channelID = channels.find(channel => channel.type === 'text').id;
  return client.channels.get(guild.systemChannelID || channelID);
};

client.on('guildCreate', (guild) => {
  getDefaultChannel(guild).send('Hello world!');
});

client.on('guildMemberAdd', (member) => {
  const message = `✨ **Welcome to Computer Science Royals, ${member.user.username}**\nWe're a student-run community of CS, IT, IS, and ISc students at UNF. If you get stuck on a project or have any questions, both in or out of class, feel free to ask around in <#456241057966063639>, <#546219353092259870>, and the Office Hours channels. To get situated, change your nickname to your first name and list any Summer B classes you're taking in <#532062406252429312>. Make yourself at home, and thanks for joining! <:swoop:593878676219887627>`;
  getDefaultChannel(member.guild).send(message);
});

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(PORT);
