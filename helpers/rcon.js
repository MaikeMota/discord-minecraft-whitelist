const { Rcon } = require('rcon-client');
const { server } = require('../config.json');

const rcon = new Rcon({
  host: server.host,
  port: server.port,
  password: server.password,
});

let connection = null;

async function sendRcon(command) {
  if (!connection) {
    connection = await rcon.connect();
  }

  let response = await connection.send(command);

  return response;
}

module.exports = { sendRcon };
