const chalk = require('chalk');
const FuzzySet = require('fuzzyset.js');

// "Intro to " will be dropped from messages
const aliases = {
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

  // Debugging

  // matches.forEach((match) => {
  //   if (match[0] === 0) {
  //     console.log(match[1]);
  //   } else {
  //     console.log(match[0], match[1].name);
  //   }
  // });

  const newRoles = matches
    .filter(([confidence]) => confidence !== 0)
    .map(([, role]) => role);

  // No matching roles found, skip message
  if (!newRoles.length) {
    return Promise.resolve();
  }

  // TODO: print the "heatmap" view of the message for easy debugging
  return (newRoles.length === 1 ? member.addRole(newRoles[0]) : member.addRoles(newRoles))
    .then(() => {
      const memberFmt = chalk.hex(member.displayColor)(member.displayName);
      const roleFmt = newRoles.map((role) => chalk.hex(role.hexColor)(role.name)).join(', ');
      console.log(`Assigning to ${memberFmt} roles ${roleFmt}`);
    })
    .then(() => member.addRoles(['533358593974730764', '533358805480767489'])) // add "SoC" and "Social"
    .then(() => member.removeRole('515944062113808404')) // remove "Unverified" role
    .catch((e) => e.code !== 50035 && console.error(e)) // ignore error if roles already exist
    .then(() => message.react('614865867854970890'));
};
