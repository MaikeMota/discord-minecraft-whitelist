const { channels } = require('../config.json');
const { sendRcon } = require('../helpers/rcon.js');

module.exports = {
  name: 'command',
  description: 'Run a command on the server',
  cooldown: 0,
  guildOnly: true,
  excludeFromHelp: true,
  execute(message, args) {
    if (message.channel.id !== channels.debug) return;
    sendRcon(args.join(' ')).then((reply) => {
      message.reply(reply);
    });
  },
};
