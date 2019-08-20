const Discord = require('discord.js');
const dotenv = require('dotenv');

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

const FuzzySet = require('fuzzyset.js');

/*
[ 'Linear Algebra',
  'Computer Science I',
  'Intro to OOP',
  'Comp Structures',
  'Intro to C#',
  'Computer Science II',
  'Automata',
  'Hardware',
  'Security',
  'Web Systems',
  'Data Structures OOP',
  'Data Structures',
  'Systems Admin',
  'Legal & Ethical',
  'Networks',
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
    'Visual and Procedural Programming': 'Intro to C#',
    'Programming 1': 'Computer Science I',
    'Programming 2': 'Computer Science II',
    'Computer Science 1': 'Computer Science I',
    'Computer Science 2': 'Computer Science II',
    CS1: 'Computer Science I',
    CS2: 'Computer Science II',
    OOP: 'Intro to OOP',
    'Object-Oriented Programming': 'Intro to OOP',
    'Computational Structures': 'Comp Structures',
    'Computability and Automata': 'Automata',
    'Hardware Lab': 'Hardware',
    'Computer Security': 'Security',
    'Web Systems Development': 'Web Systems',
    'DS OOP': 'Data Structures OOP',
    DS: 'Data Structures',
    'Legal and Ethical': 'Legal & Ethical',
    'Computer Networks': 'Networks',
    'Computer Networks and Distributed Processing': 'Networks',
    IP: 'Internet Programming',
    IDS: 'Intrusion Detection',
    AI: 'Artificial Intelligence',
    OS: 'Operating Systems',
    'OS Environments': 'Operating Systems',
    'Language Translators': 'Compilers',
  };

  // Build our fuzzyset
  const roleNames = classRoles.map((it) => it.name);
  const roleSet = FuzzySet([...roleNames, ...Object.keys(aliases)]);
});
