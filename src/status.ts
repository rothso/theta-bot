import { Message, EmbedBuilder, TextChannel } from 'discord.js';
import * as child from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';
import os from 'os';
import util from 'util';

const MEDIA_URL = 'https://cdn.discordapp.com/attachments';
const IMAGE_CLOUD = `${MEDIA_URL}/489175239830536206/788237877984362496/Google-Cloud-icon.png`;
const IMAGE_LINUX = `${MEDIA_URL}/489175239830536206/579742025604268058/linux.png`;

export const onMessage = async (message: Message): Promise<void> => {
  const { content } = message;
  const command = content.toLowerCase().trim();

  if (command === '$ status') {
    let icon: string;
    if (process.env.HOSTNAME) {
      icon = IMAGE_CLOUD;
    } else if (os.platform() === 'linux') {
      icon = IMAGE_LINUX;
    }

    // Get the OS name for the status message
    const readFile = util.promisify(fs.readFile);
    const buf = await readFile('/etc/os-release');
    const { PRETTY_NAME } = dotenv.parse(buf);

    // Get the OS details
    const memory = `${((os.freemem() / os.totalmem()) * 100).toFixed(2)}%`;
    const uptime = new Date(1000 * process.uptime()).toISOString().substr(11, 8);
    const build = child.execSync('git rev-parse --short HEAD').toString().trim();

    await (message.channel as TextChannel).send({
      embeds: [
        new EmbedBuilder({
          color: 38536,
          description: `Hello from ${PRETTY_NAME} :wave:`,
          fields: [
            { name: 'Memory', value: memory, inline: true },
            { name: 'Uptime', value: uptime },
            { name: 'Build', value: build, inline: true },
          ],
          footer: {
            ...(icon ? { icon_url: icon } : {}),
            text: new Date().toLocaleString(),
          },
        }),
      ],
    });
  }
};
