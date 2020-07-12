const config = require('../config.json');
const { updatePlayer } = require('./player');
const { sendRcon } = require('./rcon');
const Discord = require('discord.js');

const checkSubs = () => {
  const players = global.db.get('players').value();
  let users = {
    removed: [],
    gracePeriod: [],
  };

  global.client.channels.cache
    .get(config.channels.debug)
    .send('Checking all users')
    .then((message) => {
      for (let player of players) {
        if (!player.whitelisted) {
          continue;
        }

        let discordMember = message.guild.members.cache.get(player.discordID);

        if (!discordMember) {
          sendRcon(`whitelist remove ${player.minecraftUser}`);
          updatePlayer(player.discordID, {
            subbed: false,
            cyclesSinceSubLost: false,
            whitelisted: false,
          });
          continue;
        }

        if (discordMember.roles.cache.has(config.subRole)) {
          if (!player.subbed) {
            updatePlayer(player.discordID, {
              subbed: true,
              cyclesSinceSubLost: false,
            });
          }

          continue;
        }

        if (player.cyclesSinceSubLost || config.gracePeriod === 0) {
          let cycles = player.cyclesSinceSubLost;
          cycles += 1;

          if (cycles >= config.gracePeriod) {
            sendRcon(`whitelist remove ${player.minecraftUser}`);
            updatePlayer(player.discordID, {
              subbed: false,
              cyclesSinceSubLost: false,
              whitelisted: false,
            });

            users.removed.push(discordMember.displayName);
          } else {
            updatePlayer(player.discordID, {
              subbed: false,
              cyclesSinceSubLost: cycles,
              whitelisted: false,
            });

            users.gracePeriod.push(discordMember.displayName);
          }
        } else {
          updatePlayer(player.discordID, {
            subbed: false,
            cyclesSinceSubLost: 1,
          });

          users.gracePeriod.push(discordMember.displayName);
        }
      }

      const embedReport = new Discord.MessageEmbed()
        .setColor('#AD1041')
        .setTitle('User Check Report')
        .setDescription(
          'Some user may have been removed from the whitelist. See the report below.'
        )
        .addFields(
          {
            name: 'Users Removed',
            value: users.removed.length ? users.removed.join(', ') : 'None',
          },
          {
            name: 'Users in the Grace Period',
            value: users.gracePeriod.length
              ? users.gracePeriod.join(', ')
              : 'None',
          }
        );
      message.edit(embedReport);
    });

  return;
};

module.exports = checkSubs;
