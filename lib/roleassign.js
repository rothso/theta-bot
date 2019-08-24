const chalk = require('chalk');
const FuzzySet = require('fuzzyset.js');

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
  'Computer Lab': 'Hardware',
  'Hardware Lab': 'Hardware',
  Security: 'Computer Security',
  'Computer Forensics': 'Forensics',
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
  'Network Security and Management': 'Network Security',
  AI: 'Artificial Intelligence',
  OS: 'Operating Systems',
  'OS Environments': 'Operating Systems',
  'Operating Systems Environments and Administration': 'Operating Systems',
  'Big Data': 'Databases',
  'Data Modeling': 'Databases', // legacy course name
  'Language Translators': 'Compilers',
};

// Minimum match confidence for assigning a role
const threshold = 0.7;

module.exports.assignFromMessage = (message, classRoles) => {
  const { content, reactions, member } = message;

  // Ignore messages from users who have left the server
  if (!member) {
    return Promise.resolve();
  }

  // Message has already been processed
  if (reactions.some((reaction) => reaction.emoji.id === '614865867854970890')) {
    return Promise.resolve();
  }

  // Build our fuzzy set for matching
  const roleSet = FuzzySet([
    ...classRoles.map((it) => it.name),
    ...Object.keys(aliases),
  ]);

  const courses = content
    .replace(/\([^)]*\)/g, '') // Remove anything between parentheses
    .replace(/<[^)]*>/g, '') // Remove anything between angle brackets
    .split(/[.,+\n]/)
    .map((str) => str
      .replace(/Intro(?:duction)? to/i, '') // Drop "Intro to "
      .trim()
      .replace(/^and /i, '')) // Remove "and" at the start of a phrase
    .filter(Boolean);

  const matches = courses.map((course) => {
    const fuzzyMatches = roleSet.get(course);

    if (!fuzzyMatches || fuzzyMatches[0][0] < threshold) {
      return [0, course]; // if no match, return confidence of 0
    }

    // Undo the alias to get the underlying official role name
    const [confidence, roleName] = fuzzyMatches[0];
    const realRoleName = aliases[roleName] || roleName;
    const newRole = classRoles.find((role) => role.name === realRoleName);
    return [confidence, newRole];
  });

  const newRoles = matches
    .filter(([confidence]) => confidence !== 0)
    .map(([, role]) => role);

  // No matching roles found, skip message
  if (!newRoles.length) {
    return Promise.resolve();
  }

  return (newRoles.length === 1 ? member.addRole(newRoles[0]) : member.addRoles(newRoles))
    .then(() => {
      const memberFmt = chalk.hex(member.displayColor)(member.displayName);
      const roleFmt = newRoles.map((role) => chalk.hex(role.hexColor)(role.name)).join(', ');
      console.log(`Assigning to ${memberFmt} roles ${roleFmt}`);
    })
    .then(() => message.react('614865867854970890'))
    .catch(console.error);
};
