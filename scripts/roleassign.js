const client = require('../lib/discord.js');
const constants = require('../lib/constants.js');
const { filterClassRoles } = require('../lib/roles.js');
const { assignFromMessage } = require('../lib/roleassign.js');

let classRoles;
const channel = constants.CHANNEL_ROLEASSIGN;

client.on('ready', async () => {
  // Initialize list of class roles
  const { roles } = client.guilds.get(constants.SERVER);
  classRoles = filterClassRoles(roles);

  // Process any messages we have have missed
  client.channels.get(channel)
    .fetchMessages({ limit: 100 })
    .then((messages) => messages
      .map((msg) => assignFromMessage(msg, classRoles)));
});

client.on('message', async (msg) => {
  if (msg.channel.id === channel) {
    await assignFromMessage(msg, classRoles);
  }
});

client.on('guildMemberAdd', (member) => {
  // When a member joins, automatically tag them as "Unverified"
  member.addRole('515944062113808404');
});
