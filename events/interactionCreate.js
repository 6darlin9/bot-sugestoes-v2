// ===== events/interactionCreate.js =====
const approvalHandler = require('../handlers/approvalHandler');

module.exports = async (client, interaction) => {
  if (!interaction.isButton()) return;

  try {
    await approvalHandler(interaction, client);
  } catch (error) {
    console.error('Erro ao lidar com interação de botão:', error);
    
    const errorMessage = '❌ Ocorreu um erro ao processar essa ação.';
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
};