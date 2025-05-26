// ===== handlers/suggestionHandler.js =====
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config');
const logger = require('../logger');

module.exports = async (message, client) => {
  // Verificar se é no canal correto
  if (message.channel.id !== config.channels.sugestoes) return;

  const content = message.content?.trim();
  const attachment = message.attachments.first();
  
  // Verificar se é link ou anexo
  const isLink = content && /^https?:\/\//i.test(content);
  const isAttachment = !!attachment;
  
  if (!isLink && !isAttachment) return;

  try {
    // Determinar URL do conteúdo
    const contentURL = isLink ? content : attachment.url;
    const fileSize = attachment ? attachment.size : 0;
    
    // Criar embed
    const embed = new EmbedBuilder()
      .setTitle('🎥 Nova Sugestão de Vídeo')
      .setColor(0x3498db)
      .setFooter({ 
        text: `Sugestão enviada por: ${message.author.tag}`, 
        iconURL: message.author.displayAvatarURL() 
      })
      .setTimestamp();

    if (isLink) {
      embed.setDescription(`📎 **Link:** ${content}`);
    } else {
      embed.setDescription(`📎 **Vídeo anexado** (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);
      
      // Adicionar preview se for imagem/vídeo pequeno
      if (fileSize < config.maxFileSize) {
        embed.setImage(attachment.url);
      }
    }

    // Criar botões
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`aprovar_${message.id}`)
        .setLabel('✅ Aprovar')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`reprovar_${message.id}`)
        .setLabel('❌ Reprovar')
        .setStyle(ButtonStyle.Danger)
    );

    // Enviar mensagem com embed e botões
    const suggestionMessage = await message.channel.send({ 
      embeds: [embed], 
      components: [row] 
    });

    logger.info(`Nova sugestão de ${message.author.tag} (ID: ${message.id})`);
    
  } catch (error) {
    logger.error(`Erro ao processar sugestão: ${error.message}`);
  }
};