// ===== events/messageCreate.js =====
const suggestionHandler = require('../handlers/suggestionHandler');

module.exports = async (client, message) => {
  if (message.author.bot) return;
  
  await suggestionHandler(message, client);
};