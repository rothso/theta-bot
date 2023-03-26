import chalk from 'chalk';
import { Message } from 'discord.js';
import { SERVER } from '../util/constants';
import { getClassRoles } from '../util/roles';

export const onCommand = async (command: string, message: Message): Promise<void> => {
  if (command === 'great-purge') {
    const { roles, members } = message.client.guilds.cache.get(SERVER);
    const classRoles = getClassRoles(roles.cache);

    const allMembers = await members.fetch();
    await Promise.all(
      allMembers.map(async (member) => {
        // Find any class roles on the member
        const removableRoles = member.roles.cache
          .filter((role) => classRoles.includes(role));

        // Remove the roles
        await member.roles.remove(removableRoles);
        removableRoles.forEach((role) => {
          const memberFmt = chalk.hex(member.displayHexColor)(member.displayName);
          const roleFmt = chalk.hex(role.hexColor)(role.name);
          console.log(`Removing from ${memberFmt} role ${roleFmt}`);
        });
      }),
    );
  }
};

