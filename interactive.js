const Discord = require('discord.js');
const dotenv = require('dotenv');
const chalk = require('chalk');

// Dotenv
dotenv.config();
const { TOKEN } = process.env;

// Login to Discord
const client = new Discord.Client();
client.login(TOKEN);

// Server constant
const SERVER = '456241057966063636';

// Channel constants
const CHANNEL_GENERAL = '456241057966063639';
const CHANNEL_TESTING = '489120256955252769';
const CHANNEL_META = '575746377099771919';
const CHANNEL_ROLEASSIGN = '532062406252429312';

const FuzzySet = require('fuzzyset.js');

/*
[ 'Linear Algebra',
  'Statistics',
  'Computer Science I',
  'Intro to OOP',
  'Comp Structures',
  'Intro to C#',
  'Computer Science II',
  'Automata',
  'Hardware',
  'Computer Security',
  'Web Systems',
  'Data Structures OOP',
  'Data Structures',
  'IT Project Management',
  'Systems Admin',
  'Legal & Ethical',
  'Networks',
  'Algorithms',
  'Internet Programming',
  'System Software',
  'Game Development',
  'Intrusion Detection',
  'Artificial Intelligence',
  'Operating Systems',
  'Databases',
  'Software Engineering',
  'Compilers' ]
*/

client.on('ready', () => {
  const { roles } = client.guilds.get(SERVER);

  // Extract only the class roles
  const allRoles = Array.from(roles.sort((a, b) => a.position - b.position).values());
  const start = allRoles.findIndex((role) => role.name === 'Linear Algebra');
  const end = allRoles.findIndex((role) => role.name === 'Compilers');
  const classRoles = allRoles.slice(start, end + 1);

  // "Intro to " will be dropped from messages
  const aliases = {
    Stats: 'Statistics',
    'Visual and Procedural Programming': 'Intro to C#',
    'Programming 1': 'Computer Science I',
    'Programming 2': 'Computer Science II',
    'Computer Science 1': 'Computer Science I',
    'Computer Science 2': 'Computer Science II',
    'Compsci 1': 'Computer Science I',
    'Compsci 2': 'Computer Science II',
    CS1: 'Computer Science I',
    CS2: 'Computer Science II',
    OOP: 'Intro to OOP',
    'Object-Oriented Programming': 'Intro to OOP',
    'Computational Structures': 'Comp Structures',
    Computability: 'Automata',
    'Computability and Automata': 'Automata',
    'Hardware Lab': 'Hardware',
    Security: 'Computer Security',
    'Web Systems Development': 'Web Systems',
    'DS OOP': 'Data Structures OOP',
    DS: 'Data Structures',
    'Legal and Ethical': 'Legal & Ethical',
    'Computer Networks': 'Networks',
    'Computer Networks and Distributed Processing': 'Networks',
    IP: 'Internet Programming',
    'Design and Analysis of Algorithms': 'Algorithms',
    'Analysis of Algorithms': 'Algorithms',
    IDS: 'Intrusion Detection',
    AI: 'Artificial Intelligence',
    OS: 'Operating Systems',
    'OS Environments': 'Operating Systems',
    'Operating Systems Environments and Administration': 'Operating Systems',
    'Big Data': 'Databases',
    'Data Modeling': 'Databases', // legacy course name
    'Language Translators': 'Compilers',
  };

  // Build our fuzzyset
  const roleNames = classRoles.map((it) => it.name);
  const roleSet = FuzzySet([...roleNames, ...Object.keys(aliases)]);

  // Threshold
  const threshold = 0.7;

  client.channels.get(CHANNEL_ROLEASSIGN)
    .fetchMessages({ limit: 100 })
    .then((messages) => messages
      .filter((msg) => !msg.member.roles.find((role) => role.name === 'Admin!'))
      .forEach((msg) => {
        const courses = msg.content
          .replace(/\([^)]*\)/g, '') // Remove anything between parentheses
          .replace(/<[^)]*>/g, '') // Remove anything between angle brackets
          .split(/[.,+\n]/)
          .map((str) => str
            .replace(/Intro(?:duction)? to/i, '') // Drop "Intro to "
            .trim()
            .replace(/^and /i, '')) // Remove "and" at the start of a phrase
          .filter(Boolean);

        const discordRoles = courses.map((course) => {
          const fuzzyMatches = roleSet.get(course) || [];
          const best = fuzzyMatches.find((match, i) => i === 0 && match[0] >= threshold);

          if (!best) {
            return [0, course]; // if no match, return confidence of 0
          }

          // Undo the alias to get the underlying official role name
          const [confidence, name] = best;
          const roleName = aliases[name] || name;
          return [confidence, classRoles.find((role) => role.name === roleName)];
        });

        const orphans = discordRoles.filter(([confidence]) => confidence === 0);
        const matches = discordRoles.filter(([confidence]) => confidence !== 0);

        // Display output
        const content = orphans.reduce((acc, [, course]) => acc.replace(course, `${chalk.red(course)}`), msg.content);
        console.log(`${chalk.hex(msg.member.displayHexColor).bold(msg.member.displayName)}: ${content}`);
        matches.forEach(([confidence, role]) => {
          console.log(`  ${chalk.hex(role.hexColor)(role.name)} ${chalk.gray(confidence)}`);
        });
        console.log('');
      }));
});
