import { GuildMember, EmbedBuilder, TextChannel } from 'discord.js';
import { CHANNEL_TESTING } from './util/constants';

export const onGuildMemberRemove = async (member: GuildMember): Promise<void> => {
  const { guild } = member;
  const channel = guild.channels.cache.get(CHANNEL_TESTING) as TextChannel;

  // Log when someone leaves the server
  await channel.send({
    embeds: [
      new EmbedBuilder({
        description: `${member.user.tag} has left the server.`,
      }),
    ],
  });
};
