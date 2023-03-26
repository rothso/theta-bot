import { Message, EmbedBuilder, PermissionsBitField } from 'discord.js';
import * as channels from './channels';
import * as elmo from './elmo';
import * as greatpurge from './greatpurge';

export const onMessage = async (message: Message): Promise<void> => {
  const { channel } = message;
  const content = message.content.trim();
  // eslint-disable-next-line prefer-destructuring
  const member = message.member;

  if (content.startsWith('$ sudo ')) {
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await channel.send({
        embeds: [
          new EmbedBuilder({
            description: `${member.user.username} is not in the sudoers file. This incident will be reported.`,
          }),
        ],
      });
      return;
    }

    const command = content.substring('$ sudo '.length);
    await elmo.onCommand(command, message);
    await greatpurge.onCommand(command, message);
    await channels.onCommand(command, message);
  }
};
