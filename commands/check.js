const checkSubs = require('../helpers/checkSubs');

module.exports = {
  name: 'check',
  description: 'Run a manual check of the whitelist!',
  cooldown: 0,
  guildOnly: true,
  execute(message, args) {
    checkSubs();
  },
};
