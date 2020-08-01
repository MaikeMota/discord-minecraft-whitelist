const { removePlayer, getPlayer, getByMC } = require('../helpers/player');
const { channels } = require('../config.json');
const { sendRcon } = require('../helpers/rcon');

module.exports = {
  args: true,
  name: 'reset',
  description: 'Reset a player and their Minecraft username!',
  cooldown: 0,
  guildOnly: true,
  excludeFromHelp: true,
  usage: '<[id|mc]> <discordId|minecraftusername>',
  execute(message, args) {
    if (message.channel.id !== channels.debug) return;
    let player = {};
    if (args[0] === 'id') {
      console.log('Getting by ID: ' + args[1]);
      player = getPlayer(args[1]);
    } else if (args[0] === 'mc') {
      console.log('Getting by MC user: ' + args[1]);
      player = getByMC(args[1]);
    }

    sendRcon(`whitelist remove ${player.minecraftUser}`);
    removePlayer(player.discordID);

    message.reply('Player has been reset.');
  },
};
