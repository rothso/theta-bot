/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const client = require('../lib/discord.js');
const constants = require('../lib/constants.js');

const keepMessages = [
  '579692471144022017', // very first message with instructions
  '706938864106995782', // recent gif message, temporary
];

client.on('ready', async () => {
  const channel = client.channels.get(constants.CHANNEL_ROLEASSIGN);

  let userMessages;
  do {
    const messages = await channel.fetchMessages({ limit: 100 });

    userMessages = messages.filter((msg) => !keepMessages.includes(msg.id));

    for (const msg of userMessages.array()) {
      console.log(msg.id, msg.content.split('\n', 1)[0]);
      await msg.delete();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (userMessages.size >= keepMessages.length);
});
