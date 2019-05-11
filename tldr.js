const cache = require('tldr/lib/cache');
const parser = require('tldr/lib/parser');

const IMAGE_LOGO = 'https://media.discordapp.net/attachments/489175239830536206/576869532652535818/518713.png';
const IMAGE_FOOTER = 'https://media.discordapp.net/attachments/489175239830536206/576869509143592990/favicon.png';

cache.update();

exports.getPage = (command) => {
  return cache.getPage(command)
    .then(content => content || Promise.reject(`Command ${command} not found`))
    .then(content => parser.parse(content));
};

exports.getEmbed = (command) => {
  return this.getPage(command.split(/\s+/).join('-'))
    .then(page => toEmbed(page))
    .catch(() => errorEmbed(command));
};

function toEmbed(page) {
  return {
    embed: {
      color: 3915205,
      author: {
        name: page.name,
        icon_url: IMAGE_LOGO,
      },
      description: `*${page.description}*\n\u200B`,
      fields: page.examples.map(ex => {
        return { name: ex.description, value: ex.code.replace(/{{(.*?)}}/g, '$1') }
      }),
      footer: {
        icon_url: IMAGE_FOOTER,
        text: 'TLDR Pages'
      },
    },
  }
}

function errorEmbed(command) {
  return {
    embed: {
      description: `:no_entry_sign: Error: There is no TLDR page for **${command}**. ` +
        `Try running \`man ${command}\` in a terminal.`
    }
  }
}