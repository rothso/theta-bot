const Discord = require('discord.js');
const dotenv = require('dotenv');

// Read the secret from the .env file
dotenv.config();
const { TOKEN } = process.env;

// Login to Discord
const client = new Discord.Client();
client.login(TOKEN);

module.exports = client;
