import chalk from 'chalk';
import { Client, GuildMember, Message, Role, TextChannel } from 'discord.js';
import { CHANNEL_ROLEASSIGN, CHANNEL_TESTING, SERVER } from './util/constants';
import { getClassRoles, RoleSet } from './util/roles';

const EMOJI_CHECK = '614865867854970890';
const ROLE_SOC = '533358593974730764';
const ROLE_UNVERIFIED = '515944062113808404';

let classRoles: Role[];

const getMatchingRoles = (content: string): Role[] => {
  // Build our fuzzy set for matching
  const roleSet = new RoleSet(classRoles);

  const courses = content
    .replace(/\([^)]*\)/g, '') // Remove anything between parentheses
    .replace(/<[^)]*>/g, '') // Remove anything between angle brackets
    .split(/[.,+\n]/)
    .map((str) =>
      str
        .replace(/Intro(?:duction)? to/i, '') // Drop "Intro to "
        .trim()
        .replace(/^and /i, ''),
    ) // Remove "and" at the start of a phrase
    .filter(Boolean);

  return courses.reduce((roles: Role[], course) => roles.concat(roleSet.get(course) || []), []);
};

const assignRole = async (message: Message): Promise<void> => {
  const { content, reactions } = message;

  // We may have to resolve the member if processing an old message
  const member = message.member || (await message.guild.members.fetch(message.author.id));

  // Ignore messages from users who have left the server
  if (!member) return;

  // Ignore messages that have already been processed
  if (reactions.cache.some((r) => r.emoji.id === EMOJI_CHECK)) return;

  // If no matching roles found, skip message
  const newRoles = getMatchingRoles(content);
  if (!newRoles.length) return;

  // TODO: print the "heatmap" view of the message for easy debugging
  const memberFmt = chalk.hex(member.displayHexColor)(member.displayName);
  const roleFmt = newRoles.map((role) => chalk.hex(role.hexColor)(role.name)).join(', ');
  console.log(`Assigning to ${memberFmt} roles ${roleFmt}`);

  await member.roles.add([...newRoles, ROLE_SOC]);
  await member.roles.remove(ROLE_UNVERIFIED);
  await message.react(EMOJI_CHECK);
};

export const onReady = async (client: Client): Promise<void> => {
  const { channels, roles } = client.guilds.cache.get(SERVER);

  // Initialize list of class roles
  classRoles = getClassRoles(roles.cache);

  const roleChannels = [
    channels.cache.get(CHANNEL_ROLEASSIGN) as TextChannel,
    channels.cache.get(CHANNEL_TESTING) as TextChannel,
  ];

  // Process any messages we have missed
  await Promise.all(
    roleChannels.map((channel) =>
      channel.messages
        .fetch({ limit: 20, cache: true })
        .then((messages) => Promise.all(messages.map((message) => assignRole(message)))),
    ),
  );
};

export const onMessage = async (message: Message): Promise<void> => {
  if ([CHANNEL_ROLEASSIGN, CHANNEL_TESTING].includes(message.channel.id)) {
    await assignRole(message);
  }
};

export const onGuildMemberAdd = async (member: GuildMember): Promise<void> => {
  // When a member joins, automatically tag them as "Unverified"
  await member.roles.add(ROLE_UNVERIFIED);
};
