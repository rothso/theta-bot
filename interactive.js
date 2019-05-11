const Discord = require('discord.js');
const dotenv = require('dotenv');
const tldr = require('./tldr');

// Dotenv
dotenv.config();
const TOKEN = process.env.TOKEN;

// Login to Discord
const client = new Discord.Client();
client.login(TOKEN);

// Channel constants
const CHANNEL_GENERAL = "456241057966063639";
const CHANNEL_TESTING = "489120256955252769";
const CHANNEL_META    = "575746377099771919";

client.on('ready', () => {
  // Put test commands here
});