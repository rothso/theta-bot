const Discord = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const client = new Discord.Client();

const TOKEN = process.env.TOKEN;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong!');
  }
});

client.login(TOKEN);

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

require('http').createServer().listen(3000)