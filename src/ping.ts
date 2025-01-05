import { Message, TextChannel } from 'discord.js';

export const onMessage = async (message: Message): Promise<void> => {
  const content = message.content.toLowerCase().trim();

  if (content === 'ping') {
    await message.reply('pong!');
  } else if (content === 'pong') {
    await message.reply('ping!');
  } else if (content === 'marco') {
    await message.reply('polo!');
  } else {
    const [match, noun] = /^if (she|he|\w+) breathe(s)?$/i.exec(content) || [];
    if (match) {
      const reply = ['he', 'she'].includes(noun)
        ? `...${noun} a bot.`
        : "I'm only a bot, I can't tell gender :(";
      await (message.channel as TextChannel).send(reply);
    }
  }
};
