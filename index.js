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

client.on('guildCreate', (guild) => {
  const { channels } = guild;
  const channelID = channels.find(channel => channel[1].type === 'text')[0];
  const channel = client.channels.get(guild.systemChannelID || channelID);
  channel.send('Hello world!');
});

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(PORT);
