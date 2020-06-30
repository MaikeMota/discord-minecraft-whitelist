const checkSubs = require('../helpers/checkSubs');
const { channels } = require('../config.json');

module.exports = {
  name: 'check',
  description: 'Run a manual check of the whitelist!',
  cooldown: 0,
  guildOnly: true,
  excludeFromHelp: true,
  execute(message, args) {
    if (message.channel.id !== channels.debug) return;
    checkSubs();
  },
};
