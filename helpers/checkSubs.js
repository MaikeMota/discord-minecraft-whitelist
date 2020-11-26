const config = require('../config.json');
const { updatePlayer, removePlayer } = require('./player');
const { sendRcon } = require('./rcon');
const Discord = require('discord.js');

const checkSubs = () => {
  const players = global.db.get('players').value();
  console.log(players.length);
  let users = {
    removed: [],
    gracePeriod: [],
  };

  global.client.channels.cache
    .get(config.channels.debug)
    .send('Checking all users')
    .then((message) => {
      for (let player of players) {
        console.log('Tick');
        const userLog = [];
        userLog.push(`Checking player ${player.minecraftUser}`);
        let discordMember = message.guild.members.cache.get(player.discordID);

        if (!discordMember) {
          userLog.push(
            `User is no longer in Discord, removing from the whitelist and the system`
          );
          sendRcon(`whitelist remove ${player.minecraftUser}`);
          removePlayer('id', player.discordID);
          continue;
        }

        if (discordMember.roles.cache.has(config.subRole)) {
          log.push(`User is subscribed`);
          if (!player.subbed) {
            userLog.push(
              `User had lost subscription, adding it back and ensuring they're on the whitelist`
            );
            updatePlayer(player.discordID, {
              subbed: true,
              cyclesSinceSubLost: false,
            });
            sendRcon(`whitelist add ${player.minecraftUser}`);
          }

          continue;
        }

        userLog.push(`User is not subscribed`);
        if (!player.whitelisted) {
          console.log(`User is not on the whitelist, ignoring them`);
          continue;
        }

        if (player.cyclesSinceSubLost || config.gracePeriod === 0) {
          let cycles = player.cyclesSinceSubLost;
          cycles += 1;

          if (cycles >= config.gracePeriod) {
            userLog.push(
              'User has exceeded the grace period, removing from the whitelist'
            );
            sendRcon(`whitelist remove ${player.minecraftUser}`);
            updatePlayer(player.discordID, {
              subbed: false,
              cyclesSinceSubLost: false,
              whitelisted: false,
            });

            users.removed.push(discordMember.displayName);
          } else {
            userLog.push(
              'User is within the grace period, updating their information'
            );
            updatePlayer(player.discordID, {
              subbed: false,
              cyclesSinceSubLost: cycles,
            });

            users.gracePeriod.push(discordMember.displayName);
          }
        } else {
          userLog.push(
            'User has started the grace period, updating their information'
          );
          updatePlayer(player.discordID, {
            subbed: false,
            cyclesSinceSubLost: 1,
          });

          users.gracePeriod.push(discordMember.displayName);
        }

        console.log(userLog.join('. '));
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
