import chalk from 'chalk';
import { Client, GuildMember, Message, Role, TextChannel } from 'discord.js';
import FuzzySet from 'fuzzyset';
import { CHANNEL_ROLEASSIGN, CHANNEL_TESTING, SERVER } from './util/constants';
import { getClassRoles } from './util/roles';

const EMOJI_CHECK = '614865867854970890';
const ROLE_SOC = '533358593974730764';
const ROLE_SOCIAL = '533358805480767489';
const ROLE_UNVERIFIED = '515944062113808404';

let classRoles: Role[];

// "Intro to " will be dropped from messages
const aliases: Record<string, string> = {
  Stats: 'Statistics',
  'Visual and Procedural Programming': 'Intro to C#',
  'Programming 1': 'Programming I',
  'Programming 2': 'Programming II',
  'Computer Science I': 'Programming I',
  'Computer Science II': 'Programming II',
  'Computer Science 1': 'Programming I',
  'Computer Science 2': 'Programming II',
  'Compsci 1': 'Programming I',
  'Compsci 2': 'Programming II',
  CS1: 'Programming I',
  CS2: 'Programming II',
  OOP: 'Intro to OOP',
  'Object-Oriented Programming': 'Intro to OOP',
  'Computational Structures': 'Comp Structures',
  Automata: 'Theory of Computation',
  Architecture: 'Computer Architecture',
  'Architecture and Organization': 'Computer Architecture',
  Hardware: 'Computer Architecture',
  'Computer Lab': 'Computer Architecture',
  Security: 'Computer Security',
  'Computer Forensics': 'Forensics',
  'Web Systems Development': 'Web Systems',
  DS: 'Data Structures',
  'Systems Administration': 'Systems Admin',
  UI: 'User Interface Design',
  'UI Design': 'User Interface Design',
  'User Interface': 'User Interface Design',
  'Legal and Ethical': 'Legal & Ethical',
  'Computer Networks': 'Networks',
  'Computer Networks and Distributed Processing': 'Networks',
  IP: 'Internet Programming',
  'Design and Analysis of Algorithms': 'Algorithms',
  'Analysis of Algorithms': 'Algorithms',
  IDS: 'Intrusion Detection',
  'Web Dev': 'Web Dev Frameworks',
  'Network Security and Management': 'Network Security',
  ML: 'Machine Learning',
  AI: 'Artificial Intelligence',
  OS: 'Operating Systems',
  'Ahuja OS': 'Operating Systems',
  'OS Env': 'Operating Systems Env',
  'OS Environments': 'Operating Systems Env',
  'Littleton OS': 'Operating Systems Env',
  'Operating Systems Environments and Administration': 'Operating Systems Env',
  'Big Data': 'Databases',
  'Data Modeling': 'Databases', // legacy course name
  'Information Systems Senior Project': 'IS Senior Project',
  'Language Translators': 'Compilers',
};

// Minimum match confidence for assigning a role
const threshold = 0.7;

const getMatchingRoles = (content: string): Role[] => {
  // Build our fuzzy set for matching
  const roleSet = FuzzySet([...classRoles.map((it) => it.name), ...Object.keys(aliases)]);

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

  return courses.reduce((roles: Role[], course) => {
    const fuzzyMatches = roleSet.get(course);

    if (!fuzzyMatches || fuzzyMatches[0][0] < threshold) {
      return roles; // if no match, return
    }

    // Undo the alias to get the underlying official role name
    const [confidence, roleName] = fuzzyMatches[0];
    const realRoleName = aliases[roleName] || roleName;
    const newRole = classRoles.find((role) => role.name === realRoleName);

    return confidence > 0 ? roles.concat(newRole) : roles;
  }, []);
};

const assignRole = async (message: Message): Promise<void> => {
  const { content, reactions } = message;
  // eslint-disable-next-line prefer-destructuring
  const member = message.member;

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

  await member.roles.add([...newRoles, ROLE_SOC, ROLE_SOCIAL]);
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
        .fetch({ limit: 100 }, true, true)
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
