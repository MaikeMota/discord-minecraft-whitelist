function getPlayer(id) {
  let player = global.db.get('players').filter({ discordID: id }).value();

  return player[0];
}

function updatePlayer(id, args) {
  global.db.get('players').find({ discordID: id }).assign(args).write();
}

function createPlayer(
  id,
  mcUser,
  whitelisted = false,
  subbed = false,
  lostSub = false
) {
  global.db
    .get('players')
    .push({
      discordID: id,
      minecraftUser: mcUser,
      whitelisted: whitelisted,
      subbed: subbed,
      cyclesSinceSubLost: lostSub,
    })
    .write();
}

module.exports = { getPlayer, updatePlayer, createPlayer };
