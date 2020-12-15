import { Message, MessageEmbed } from 'discord.js';
import config from 'tldr/lib/config';
import Cache from 'tldr/lib/cache';
import parser from 'tldr/lib/parser';

const MEDIA_URL = 'https://cdn.discordapp.com/attachments';
const IMAGE_LOGO = `${MEDIA_URL}/489175239830536206/579742025604268058/linux.png`;
const IMAGE_FOOTER = `${MEDIA_URL}/489175239830536206/576869509143592990/favicon.png`;

// Download the tldr pages locally when the bot first runs
const cache = new Cache(config.get());
cache.update().catch((err) => console.log(err));

const getPage = async (command: string): Promise<Tldr.Page> => {
  const content = await cache.getPage(command);
  if (!content) throw new Error(`Command ${command} not found`);
  return parser.parse(content);
};

export const onMessage = async (message: Message): Promise<void> => {
  const { channel, content } = message;
  const [match, command] = /^\$\s?man ([\w\s-]+)$/i.exec(content) || [];

  if (match) {
    try {
      const page = await getPage(command.split(/\s+/).join('-'));
      await channel.send(
        new MessageEmbed({
          color: 3915205,
          author: {
            name: page.name,
            icon_url: IMAGE_LOGO,
          },
          description: `*${page.description}*\n\u200B`,
          fields: page.examples.map((ex) => ({
            name: ex.description,
            value: ex.code.replace(/{{(.*?)}}/g, '$1'),
          })),
          footer: {
            icon_url: IMAGE_FOOTER,
            text: 'TLDR Pages',
          },
        }),
      );
    } catch (err) {
      await channel.send(
        new MessageEmbed({
          description:
            `:no_entry_sign: Error: There is no TLDR page for **${command}**. ` +
            `Try running \`man ${command}\` in a Linux terminal.`,
        }),
      );
    }
  }
};
