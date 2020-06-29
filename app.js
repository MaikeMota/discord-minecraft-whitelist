const config = require('./config.json');
const fs = require('fs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const CronJob = require('cron').CronJob;
const checkSubs = require('./helpers/checkSubs');

const { token, prefix, channels } = config;

const adapter = new FileSync('players.json');
global.db = low(adapter);
global.db.defaults({ players: [] }).write();

const Discord = require('discord.js');
const client = new Discord.Client();
global.client = client;
client.commands = new Discord.Collection();

const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.once('ready', () => {
  console.clear();
  console.log(`Logged in as ${client.user.tag}! Ready to start working.`);
});

client.on('message', (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) return;

  if (
    message.channel.type !== 'dm' &&
    message.channel.id !== channels.role &&
    message.channel.id !== channels.debug
  ) {
    return;
  }

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nPlease try again with the following format: \`${prefix}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply("I can't execute that command inside DMs!");
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `please wait ${timeLeft.toFixed(1)} more second${
          timeLeft.toFixed(1) > 1 ? 's' : ''
        }` + ` before reusing the \`${command.name}\` command.`
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, args, db);
  } catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command!');
  }
});

if (config.enableCronJob) {
  const job = new CronJob(
    config.cronTab,
    function () {
      checkSubs();
    },
    null,
    true,
    config.timeZone
  );
  job.start();
}

process.on('uncaughtException', function (err) {
  console.error(err);
});

client.login(token);
