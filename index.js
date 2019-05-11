const Discord = require('discord.js');
const http = require('http');
const dotenv = require('dotenv');
const tldr = require('./tldr');

dotenv.config();
const TOKEN = process.env.TOKEN;
const PORT = 3000;

const client = new Discord.Client();
client.login(TOKEN);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content.toLowerCase() === 'ping') {
    msg.reply('pong!');
  } else if (msg.content.toLowerCase() === 'marco') {
    msg.reply('polo!');
  } else if (match = msg.content.match(/if (she|he|\w+) breathe(s)?/i)) {
    let noun = match[1];
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

client.on('guildCreate', guild => {
  let channelID;
  let channels = guild.channels;
  channelLoop:
  for (let c of channels) {
      let channelType = c[1].type;
      if (channelType === "text") {
          channelID = c[0];
          break channelLoop;
      }
  }

  let channel = client.channels.get(guild.systemChannelID || channelID);
  channel.send(`Hello world!`);
});

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(PORT);