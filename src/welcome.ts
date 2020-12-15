import { GuildMember } from 'discord.js';

export const onGuildMemberAdd = async (member: GuildMember): Promise<void> => {
  const { guild, user } = member;

  const message =
    `✨ **Welcome to Computer Science Royals, <@${user.id}>**\n` +
    "We're a student-run community of CS, IT, IS, and ISc students at UNF. If you get " +
    'stuck on a project or have any questions, both in or out of class, feel free to ' +
    'ask around in <#456241057966063639>, <#546219353092259870>, and the Office Hours ' +
    'channels. **Please change your nickname to your first name** and list any classes ' +
    "you're taking in <#532062406252429312>. Make yourself at home, and thanks for " +
    'joining! <:swoop:593878676219887627>';

  const welcomeChannel = guild.systemChannel;
  await welcomeChannel.send(message);
};
