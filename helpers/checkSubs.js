const config = require('../config.json');
const { updatePlayer, removePlayer } = require('./player');
const { sendRcon } = require('./rcon');
const Discord = require('discord.js');

const checkSubs = async () => {
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
				console.log(player);
				
        let discordMember = await message.guild.members.cache.get(player.discordID);
        console.log(discordMember);

        if (!discordMember) {
          console.log(
            `${player.minecraftUser} is no longer in Discord, removing from the whitelist and the system`
          );
          //sendRcon(`whitelist remove ${player.minecraftUser}`);
          //removePlayer('id', player.discordID);
          continue;
        }

        if (discordMember.roles.cache.has(config.subRole)) {
          console.log(`${player.minecraftUser} is subscribed`);
          if (!player.subbed) {
            console.log(
              `${player.minecraftUser} had lost subscription, adding it back and ensuring they're on the whitelist`
            );
            updatePlayer(player.discordID, {
              subbed: true,
              cyclesSinceSubLost: false,
            });
            //sendRcon(`whitelist add ${player.minecraftUser}`);
          }

          continue;
        }

        if (!player.whitelisted) {
          console.log(
            `${player.minecraftUser} is not on the whitelist, ignoring them`
          );
          continue;
        }

        if (player.cyclesSinceSubLost || config.gracePeriod === 0) {
          let cycles = player.cyclesSinceSubLost;
          cycles += 1;

          if (cycles >= config.gracePeriod) {
            console.log(
              `${player.minecraftUser} has exceeded the grace period, removing from the whitelist`
            );
            //sendRcon(`whitelist remove ${player.minecraftUser}`);
            /*
						updatePlayer(player.discordID, {
              subbed: false,
              cyclesSinceSubLost: false,
              whitelisted: false,
						});
						*/

            users.removed.push(discordMember.displayName);
          } else {
            console.log(
              `${player.minecraftUser} is within the grace period, updating their information`
            );
            /*
            updatePlayer(player.discordID, {
              subbed: false,
              cyclesSinceSubLost: cycles,
            });
						*/

            users.gracePeriod.push(discordMember.displayName);
          }
        } else {
          console.log(
            `${player.minecraftUser} has started the grace period, updating their information`
          );
          /*
          updatePlayer(player.discordID, {
            subbed: false,
            cyclesSinceSubLost: 1,
					});
					*/

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
