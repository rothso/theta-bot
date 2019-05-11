const cache = require('tldr/lib/cache');
const parser = require('tldr/lib/parser');

exports.getPage = (command) => {
  return cache.getPage(command)
    .then(content => content || cache.update()
      .then(() => console.log('Updating cache...'))
      .then(() => cache.getPage(command))
      .then(content => content || Promise.reject(`Command ${command} not found`))
    )
    .then(content => parser.parse(content));
};