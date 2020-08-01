const getPlayer = (id) => {
  let player = global.db.get('players').filter({ discordID: id }).value();

  return player[0];
};

const getByMC = (mcUser) => {
  let player = global.db
    .get('players')
    .filter({ minecraftUser: mcUser })
    .value();

  return player[0];
};

function updatePlayer(id, args) {
  global.db.get('players').find({ discordID: id }).assign(args).write();
}

const createPlayer = (
  id,
  mcUser,
  whitelisted = false,
  subbed = false,
  lostSub = false
) => {
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
};

const removePlayer = (id) => {
  global.db.get('players').remove({ discordID: id }).write();
};

module.exports = {
  getPlayer,
  updatePlayer,
  createPlayer,
  removePlayer,
  getByMC,
};
