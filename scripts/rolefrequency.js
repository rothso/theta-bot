const chalk = require('chalk');
const client = require('../lib/discord.js');
const constants = require('../lib/constants.js');
const { filterClassRoles } = require('../lib/roles.js');

client.on('ready', () => {
  // Initialize list of class roles
  const { roles } = client.guilds.get(constants.SERVER);
  const classRoles = filterClassRoles(roles);

  // Sort by frequency (desc)
  classRoles
    .sort((a, b) => b.members.size - a.members.size)
    .forEach((r) => console.log(`${chalk.gray(r.members.size)} ${chalk.hex(r.hexColor)(r.name)}`));
});
