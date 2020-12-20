import { Client, GuildMember, Message } from 'discord.js';
import 'dotenv/config';
import * as admin from './admin';
import * as interactive from './interactive';
import * as manpages from './manpages';
import * as roleassign from './roleassign';
import * as ping from './ping';
import * as status from './status';
import * as welcome from './welcome';

const client = new Client();

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  await roleassign.onReady(client);
  await interactive.onReady(client);
});

client.on('message', async (message: Message) => {
  await ping.onMessage(message);
  await status.onMessage(message);
  await manpages.onMessage(message);
  await roleassign.onMessage(message);
  await admin.onMessage(message);
});

client.on('guildMemberAdd', async (member: GuildMember) => {
  await welcome.onGuildMemberAdd(member);
  await roleassign.onGuildMemberAdd(member);
});

// Read the secret from the .env file and log in
client.login(process.env.TOKEN).catch((err) => console.log(err));
