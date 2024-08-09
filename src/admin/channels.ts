import { BigQuery } from '@google-cloud/bigquery';
import {
  Guild,
  Message,
  EmbedBuilder,
  TextChannel,
  CategoryChannel,
  ChannelType,
} from 'discord.js';
import memoizee from 'memoizee';
import { CATEGORY_CLASS_ARCHIVE, CATEGORY_OFFICE_HOURS } from '../util/constants';
import { getClassRoles, RoleSet } from '../util/roles';

type Result = {
  title: string;
  course: string;
};

const bigquery = new BigQuery();

const getCourses = memoizee(
  async (term: string): Promise<Result[]> => {
    const query = `
    select distinct d.title, d.course
      from \`syllabank-4e5b9.isqool.departments\` d
     where d.term = @term
           and safe_cast(safe.substr(d.course, 4, 4) as int64) < 5000
     order by safe_cast(safe.substr(d.course, 4, 4) as int64)
  `;

    const options = {
      query,
      location: 'US',
      params: { term },
    };

    // Run the query as a job
    const [job] = await bigquery.createQueryJob(options);
    const [rows] = await job.getQueryResults();
    return rows as Result[];
  },
  { promise: true },
);

const getStatistics = async (guild: Guild, term: string) => {
  const { roles, channels } = guild;

  const classRoles = getClassRoles(roles.cache);
  const roleSet = new RoleSet(classRoles);

  const roleChannels = channels.cache
    .filter((channel) => ['Office Hours', 'Archive'].includes(channel.parent?.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((channel) => ({
      channel: channel as TextChannel,
      role: roleSet.get(channel.name.replace(/[\W_]+/g, ' ').trim()),
      isArchived: channel.parent?.name === 'Archive',
    }))
    .filter((it) => it.role);

  const courses = await getCourses(term);
  const roleCourses = courses
    .map((result) => ({
      ...result,
      title: result.title.replace(/Intro(?:duction)? to|.*-|.*:\s?/i, ''),
    }))
    .map((result) => ({
      title: result.title,
      role: roleSet.get(result.title),
    }));

  const channelRoles = roleChannels.map((it) => it.role);
  const semesterRoles = roleCourses.map((it) => it.role).filter((role) => role);

  // Statistics!
  return {
    channelsToKeep: roleChannels.filter((it) => semesterRoles.includes(it.role) && !it.isArchived),
    channelsToHide: roleChannels.filter((it) => !semesterRoles.includes(it.role) && !it.isArchived),
    channelsToShow: roleChannels.filter((it) => semesterRoles.includes(it.role) && it.isArchived),
    missingChannels: semesterRoles.filter((role) => !channelRoles.includes(role)),
    missingRoles: roleCourses.filter((it) => !it.role),
  };
};

const reorderChannels = async (category: CategoryChannel) => {
  const orderedChannels = [
    ...category.children.cache
      .filter((channel) => channel.type === ChannelType.GuildText)
      .sorted((channelA, channelB) => channelA.name.localeCompare(channelB.name))
      .values(),
  ];

  // eslint-disable-next-line no-restricted-syntax
  for await (const [pos, channel] of orderedChannels.entries()) {
    if (channel.position !== pos) {
      await channel.setPosition(pos);
    }
  }
};

const moveChannels = async (
  channels: TextChannel[],
  category: CategoryChannel,
  reorder = true,
): Promise<number> => {
  const channelsToMove = channels.filter((c) => c.parentId !== category.id);

  if (!channelsToMove.length) return 0;

  for (var channel of channelsToMove) {
    await channel.setParent(category, { lockPermissions: true });
  }

  if (reorder) await reorderChannels(category);

  return channelsToMove.length;
};

export const onCommand = async (command: string, message: Message): Promise<void> => {
  // TODO: command parser
  const [match, cmd, subcommand, arg] = /^([a-z]+) ([a-z]+) (.*)$/.exec(command) || [];

  if (!match) return;

  if (cmd === 'channels' && subcommand === 'status' && arg) {
    const [argMatch, term] = /^([A-Za-z]+ [0-9]+)$/.exec(arg) || [];

    if (!argMatch) return;

    const {
      channelsToKeep,
      channelsToHide,
      channelsToShow,
      missingChannels,
      missingRoles,
    } = await getStatistics(message.guild, term);

    const channelsToKeepRoles = channelsToKeep.map((it) => it.role.name).join('\n') || '*None*';
    const channelsToKeepNames = channelsToKeep.map((it) => it.channel).join('\n') || '\u200B';
    const channelsToHideRoles = channelsToHide.map((it) => it.role.name).join('\n') || '*None*';
    const channelsToHideNames = channelsToHide.map((it) => it.channel).join('\n') || '\u200B';
    const channelsToShowRoles = channelsToShow.map((it) => it.role.name).join('\n') || '*None*';
    const channelsToShowNames = channelsToShow.map((it) => it.channel).join('\n') || '\u200B';
    const noChannels = missingChannels.map((role) => role.name).join('\n') || '*None*';
    const noRoles = missingRoles.map((course) => course.title).join('\n') || '*None*';

    await message.channel.send({
      embeds: [
        new EmbedBuilder({
          title: `🪄  Server Mode: ${term}`,
          description:
            `Run \`sudo channels sync "${term}"\` to synchronize Office Hours.\n` +
            'Run `sudo channels up <channel>` to activate a class channel.\n' +
            'Run `sudo channels down <channel>` to deactivate a class channel.',
          fields: [
            { name: 'Channels to Keep', value: channelsToKeepRoles },
            { name: '\u200B', value: '\u200B' },
            { name: '\u200B', value: channelsToKeepNames },
            { name: 'Channels to Deactivate', value: channelsToHideRoles },
            { name: '\u200B', value: '\u200B' },
            { name: '\u200B', value: channelsToHideNames },
            { name: 'Channels to Activate', value: channelsToShowRoles },
            { name: '\u200B', value: '\u200B' },
            { name: '\u200B', value: channelsToShowNames },
            { name: 'Missing Channels', value: noChannels },
            { name: '\u200B', value: '\u200B' },
            { name: 'Missing Roles', value: noRoles },
          ].map((field) => ({ ...field, inline: true })),
        }),
      ],
    });
  } else if (cmd === 'channels' && subcommand === 'sync' && arg) {
    const [argMatch, term] = /^([A-Za-z]+ [0-9]+)$/.exec(arg) || [];

    if (!argMatch) return;

    const { channelsToHide, channelsToShow } = await getStatistics(message.guild, term);

    const hiddenCount = await moveChannels(
      channelsToHide.map((c) => c.channel),
      message.guild.channels.cache.get(CATEGORY_CLASS_ARCHIVE) as CategoryChannel,
    );

    const shownCount = await moveChannels(
      channelsToShow.map((c) => c.channel),
      message.guild.channels.cache.get(CATEGORY_OFFICE_HOURS) as CategoryChannel,
    );

    await message.channel.send({
      embeds: [
        new EmbedBuilder({
          title: `🪄  Server Mode: ${term}`,
          description:
            `Moved ${shownCount} channels to **Office Hours**.\n` +
            `Moved ${hiddenCount} channels to **Archive**.`,
        }),
      ],
    });
  } else if (cmd === 'channels' && subcommand in ['up', 'down'] && arg) {
    const [argMatch, channelId] = /^<#([0-9]+)>$/.exec(arg) || [];

    if (!argMatch) return;

    const categoryId = subcommand === 'up' ? CATEGORY_OFFICE_HOURS : CATEGORY_CLASS_ARCHIVE;

    const channel = message.guild.channels.cache.get(channelId) as TextChannel;
    const category = message.guild.channels.cache.get(categoryId) as CategoryChannel;

    const updatedCount = await moveChannels([channel], category);

    await message.channel.send({
      embeds: [
        new EmbedBuilder({
          description:
            updatedCount > 0
              ? `Moved ${channel} to **${category.name}**.`
              : `Nothing to do: ${channel} is already in **${category.name}**.`,
        }),
      ],
    });
  }
};
