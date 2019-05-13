const cache = require('tldr/lib/cache');
const parser = require('tldr/lib/parser');

const IMAGE_LOGO = 'https://media.discordapp.net/attachments/489175239830536206/576869532652535818/518713.png';
const IMAGE_FOOTER = 'https://media.discordapp.net/attachments/489175239830536206/576869509143592990/favicon.png';

// Download the tldr pages locally when the bot first runs
cache.update();

const toEmbed = page => ({
  embed: {
    color: 3915205,
    author: {
      name: page.name,
      icon_url: IMAGE_LOGO,
    },
    description: `*${page.description}*\n\u200B`,
    fields: page.examples.map(ex => ({
      name: ex.description,
      value: ex.code.replace(/{{(.*?)}}/g, '$1'),
    })),
    footer: {
      icon_url: IMAGE_FOOTER,
      text: 'TLDR Pages',
    },
  },
});

const errorEmbed = command => ({
  embed: {
    description: `:no_entry_sign: Error: There is no TLDR page for **${command}**. `
      + `Try running \`man ${command}\` in a terminal.`,
  },
});

exports.getPage = command => cache.getPage(command)
  .then(content => content || Promise.error(`Command ${command} not found`))
  .then(content => parser.parse(content));

exports.getEmbed = command => this.getPage(command.split(/\s+/).join('-'))
  .then(page => toEmbed(page))
  .catch(() => errorEmbed(command));
