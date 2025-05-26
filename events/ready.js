// ===== events/ready.js =====
const logger = require('../logger');

module.exports = (client) => {
  logger.info(`🤖 Bot online como ${client.user.tag}`);
  logger.info(`🔗 Conectado a ${client.guilds.cache.size} servidor(es)`);
};
