const { sendRcon } = require('../helpers/rcon.js');
const { getPlayer, updatePlayer, createPlayer } = require('../helpers/player');
const { subRole } = require('../config.json');

module.exports = {
  args: true,
  name: 'join',
  description: 'Add yourself to the server whitelist!',
  aliases: ['add'],
  usage: '<minecraftusername>',
  cooldown: 0,
  guildOnly: true,
  execute(message, args) {
    const id = message.member.id;
    let player = getPlayer(id);
    const subbed = message.member.roles.cache.has(subRole);

    if (!player) {
      createPlayer(id, args[0], false, subbed, !subbed);

      player = getPlayer(id);
    }

    if (player.whitelisted) {
      message.reply(
        'You have already whitelisted an account on the server. Please contact a moderator if you need to change your username or if this is an error;'
      );
      return;
    }

    if (!player.subbed) {
      if (subbed) {
        updatePlayer(id, { subbed: true, cyclesSinceSubLost: false });
      } else {
        message.reply(
          'You cannot join as you do not have the subscriber role. Please contact a moderator if this is an error.'
        );
        return;
      }
    }

    sendRcon(`whitelist add ${args[0]}`).then((reply) => {
      if (
        reply.toLowerCase() == `added ${args[0].toLowerCase()} to the whitelist`
      ) {
        updatePlayer(id, { whitelisted: true });
        message.reply("You've been added to the whitelist!");
      } else {
        message.reply(
          'There was an error adding you to the whitelist. The server returned this message: ' +
            reply
        );
      }
    });
  },
};
