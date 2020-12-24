/* eslint-disable no-await-in-loop */
import { Collection, Message, TextChannel } from 'discord.js';
import { CHANNEL_ROLEASSIGN } from '../util/constants';

const keepMessages = [
  '579692471144022017', // very first message with instructions
];

export const onCommand = async (command: string, message: Message): Promise<void> => {
  if (command === 'clear-roleassign') {
    const channel = message.client.channels.cache.get(CHANNEL_ROLEASSIGN) as TextChannel;

    // Unleash elmo
    const elmo = await channel.send(
      'https://tenor.com/view/burn-elmo-pyro-burn-it-down-ashes-gif-5632946',
    );

    let messages: Collection<string, Message>;
    let lastMessageId = elmo.id;

    // Begin clearing all messages
    do {
      messages = await channel.messages.fetch({ limit: 100, before: lastMessageId });
      lastMessageId = messages.last()?.id;

      await Promise.all(
        messages
          .filter((msg) => !keepMessages.includes(msg.id))
          .map((msg) =>
            msg
              .delete({ timeout: 1000 })
              .then(() => console.log(`Deleted: ${msg.content.split('\n', 1)[0]}`)),
          ),
      );
    } while (messages.size > keepMessages.length);

    // Delete our elmo
    await elmo.delete();
  }
};
