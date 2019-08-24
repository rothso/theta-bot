const chalk = require('chalk');
const client = require('../lib/discord.js');
const constants = require('../lib/constants.js');
const { filterClassRoles } = require('../lib/roles.js');

client.on('ready', () => {
  const { roles, members } = client.guilds.get(constants.SERVER);
  const classRoles = filterClassRoles(roles);

  members.forEach((member) => {
    member.roles.forEach((role) => {
      if (classRoles.includes(role)) {
        member.removeRole(role).then(() => {
          const memberFmt = chalk.hex(member.displayColor)(member.displayName);
          const roleFmt = chalk.hex(role.hexColor)(role.name);
          console.log(`Removing from ${memberFmt} role ${roleFmt}`);
        }).catch(console.error);
      }
    });
  });
});
