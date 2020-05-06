/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const chalk = require('chalk');
const client = require('../lib/discord.js');
const constants = require('../lib/constants.js');
const { filterClassRoles } = require('../lib/roles.js');

client.on('ready', async () => {
  const { roles, members } = client.guilds.get(constants.SERVER);
  const classRoles = filterClassRoles(roles);

  for (const member of members.array()) {
    for (const role of member.roles.array()) {
      if (classRoles.includes(role)) {
        await member.removeRole(role);
        await new Promise((resolve) => setTimeout(resolve, 300));

        const memberFmt = chalk.hex(member.displayColor)(member.displayName);
        const roleFmt = chalk.hex(role.hexColor)(role.name);
        console.log(`Removing from ${memberFmt} role ${roleFmt}`);
      }
    }
  }
});
