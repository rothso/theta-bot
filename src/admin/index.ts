import { Message, MessageEmbed, Permissions } from 'discord.js';
import * as elmo from './elmo';
import * as greatpurge from './greatpurge';

export const onMessage = async (message: Message): Promise<void> => {
  const { channel, client } = message;
  const content = message.content.toLowerCase().trim();
  // eslint-disable-next-line prefer-destructuring
  const member = message.member;

  if (content.startsWith('$ sudo ')) {
    if (!member.hasPermission(Permissions.FLAGS.ADMINISTRATOR)) {
      await channel.send(
        new MessageEmbed({
          description: `${member.user.username} is not in the sudoers file. This incident will be reported.`,
        }),
      );
      return;
    }

    const command = content.substr('$ sudo '.length);
    await elmo.onCommand(command, client);
    await greatpurge.onCommand(command, client);
  }
};
