/* eslint-disable no-await-in-loop */
const Confirm = require('prompt-confirm');
const client = require('../lib/discord.js');
const constants = require('../lib/constants.js');

const keepMessages = [
  '579692471144022017', // very first message with instructions
  '656295739487551488', // recent message from Kyle, temporary
];

client.on('ready', async () => {
  const channel = client.channels.get(constants.CHANNEL_ROLEASSIGN);

  let userMessages;
  do {
    const messages = await channel.fetchMessages({ limit: 100 });

    userMessages = messages.filter((msg) => !keepMessages.includes(msg.id));
    userMessages.forEach((msg) => console.log(msg.id, msg.content.split('\n', 1)[0]));

    const prompt = new Confirm('Delete these messages from the channel?');
    const answer = await prompt.run();
    if (answer) {
      await Promise.all(userMessages.map((msg) => msg.delete()));
    } else {
      process.exit();
    }
  } while (userMessages.size >= 2);
});
