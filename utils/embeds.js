// ===== utils/embeds.js =====
const { EmbedBuilder } = require('discord.js');

function createApprovalEmbed(originalMessage, approver) {
  const attachment = originalMessage.attachments.first();
  const content = originalMessage.content;
  const isLink = content && /^https?:\/\//i.test(content);
  
  return new EmbedBuilder()
    .setTitle('✅ Sugestão Aprovada')
    .setDescription(isLink ? `📎 **Link:** ${content}` : '📎 **Vídeo aprovado**')
    .setColor(0x00ff00)
    .addFields([
      { name: '👤 Sugerido por', value: originalMessage.author.tag, inline: true },
      { name: '✅ Aprovado por', value: approver.tag, inline: true },
      { name: '📅 Data', value: new Date().toLocaleDateString('pt-BR'), inline: true }
    ])
    .setFooter({ 
      text: 'Sistema de Sugestões', 
      iconURL: originalMessage.author.displayAvatarURL() 
    })
    .setTimestamp();
}

function createRejectionEmbed(originalMessage, rejector) {
  const attachment = originalMessage.attachments.first();
  const content = originalMessage.content;
  const isLink = content && /^https?:\/\//i.test(content);
  
  return new EmbedBuilder()
    .setTitle('❌ Sugestão Reprovada')
    .setDescription(isLink ? `📎 **Link:** ${content}` : '📎 **Vídeo reprovado**')
    .setColor(0xff0000)
    .addFields([
      { name: '👤 Sugerido por', value: originalMessage.author.tag, inline: true },
      { name: '❌ Reprovado por', value: rejector.tag, inline: true },
      { name: '📅 Data', value: new Date().toLocaleDateString('pt-BR'), inline: true }
    ])
    .setFooter({ 
      text: 'Sistema de Sugestões', 
      iconURL: originalMessage.author.displayAvatarURL() 
    })
    .setTimestamp();
}

module.exports = { createApprovalEmbed, createRejectionEmbed };