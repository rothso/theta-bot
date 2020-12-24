import { BigQuery } from '@google-cloud/bigquery';
import { Guild, Message, MessageEmbed } from 'discord.js';
import memoizee from 'memoizee';
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
      channel: channel.toString(),
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

export const onCommand = async (command: string, message: Message): Promise<void> => {
  // TODO: command parser
  const [match, cmd, subcommand, term] =
    /^([a-z]+) ([a-z]+) ([A-Za-z]+ [0-9]+)$/.exec(command) || [];

  if (!match) return;

  if (cmd === 'channels' && subcommand === 'status' && term) {
    const {
      channelsToKeep,
      channelsToHide,
      channelsToShow,
      missingChannels,
      missingRoles,
    } = await getStatistics(message.guild, term);

    const channelsToKeepRoles = channelsToKeep.map((it) => it.role.name).join('\n');
    const channelsToKeepNames = channelsToKeep.map((it) => it.channel).join('\n');
    const channelsToHideRoles = channelsToHide.map((it) => it.role.name).join('\n') || '*None*';
    const channelsToHideNames = channelsToHide.map((it) => it.channel).join('\n') || '\u200B';
    const channelsToShowRoles = channelsToShow.map((it) => it.role.name).join('\n') || '*None*';
    const channelsToShowNames = channelsToShow.map((it) => it.channel).join('\n') || '\u200B';
    const noChannels = missingChannels.map((role) => role.name).join('\n');
    const noRoles = missingRoles.map((course) => course.title).join('\n');

    await message.channel.send(
      new MessageEmbed({
        title: `🪄  Server Mode: ${term}`,
        description:
          `Run \`sudo channels synchronize "${term}"\` to synchronize Office Hours.\n` +
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
    );
  }
};
