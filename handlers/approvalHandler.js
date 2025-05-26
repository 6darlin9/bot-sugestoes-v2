// ===== handlers/approvalHandler.js (CORRIGIDO) =====
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config');
const logger = require('../logger');
const { hasStaffPermission } = require('../utils/permissions');
const { createApprovalEmbed, createRejectionEmbed } = require('../utils/embeds');

module.exports = async (interaction, client) => {
  const customId = interaction.customId;
  
  // Verificar se é botão de aprovação/reprovação
  if (!customId.startsWith('aprovar_') && !customId.startsWith('reprovar_')) return;

  // Responder imediatamente para evitar timeout
  try {
    await interaction.deferReply({ flags: 64 }); // ephemeral: true usando flags
  } catch (error) {
    logger.error(`Erro ao deferir interação: ${error.message}`);
    return;
  }

  // Verificar permissão
  if (!hasStaffPermission(interaction.member, config)) {
    return await safeFollowUp(interaction, {
      content: '❌ Você não tem permissão para aprovar/reprovar sugestões.',
      flags: 64 // ephemeral: true
    });
  }

  const isApproval = customId.startsWith('aprovar_');
  const messageId = customId.split('_')[1];
  
  try {
    // Buscar mensagem original
    const originalMessage = await interaction.channel.messages.fetch(messageId).catch(() => null);
    
    if (!originalMessage) {
      return await safeFollowUp(interaction, {
        content: '❌ Mensagem original não encontrada.',
        flags: 64
      });
    }

    // Desabilitar botões
    const disabledRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('aprovar_disabled')
        .setLabel('✅ Aprovar')
        .setStyle(ButtonStyle.Success)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId('reprovar_disabled')
        .setLabel('❌ Reprovar')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true)
    );

    if (isApproval) {
      await handleApproval(interaction, originalMessage, client, disabledRow);
    } else {
      await handleRejection(interaction, originalMessage, client, disabledRow);
    }

  } catch (error) {
    logger.error(`Erro ao processar aprovação/reprovação: ${error.message}`);
    await safeFollowUp(interaction, {
      content: '❌ Erro ao processar a ação.',
      flags: 64
    });
  }
};

// Função auxiliar para responder com segurança
async function safeFollowUp(interaction, options) {
  try {
    return await interaction.followUp(options);
  } catch (error) {
    logger.error(`Erro ao enviar followUp: ${error.message}`);
  }
}

async function handleApproval(interaction, originalMessage, client, disabledRow) {
  const author = originalMessage.author;
  const attachment = originalMessage.attachments.first();
  const content = originalMessage.content;
  const isLink = content && /^https?:\/\//i.test(content);
  const fileSize = attachment ? attachment.size : 0;
  const isLargeFile = fileSize >= config.maxFileSize;

  // Criar embed de aprovação
  const approvalEmbed = createApprovalEmbed(originalMessage, interaction.user);

  if (isLargeFile && attachment) {
    // ========== ARQUIVOS GRANDES (8MB+) ==========
    await originalMessage.reply({ embeds: [approvalEmbed] });
    
    // Enviar no canal de aprovados
    const approvedChannel = client.channels.cache.get(config.channels.aprovados);
    if (approvedChannel) {
      await approvedChannel.send({
        content: `📺 Vídeo aprovado! Mensagem original: ${originalMessage.url}`,
        embeds: [approvalEmbed]
      });
    }
    
  } else {
    // ========== LINKS OU ARQUIVOS PEQUENOS (<8MB) ==========
    
    // Criar novo embed com preview
    const newEmbed = new EmbedBuilder()
      .setTitle('✅ Vídeo Aprovado')
      .setDescription(isLink ? `📎 **Link:** ${content}` : '📎 **Vídeo aprovado**')
      .setColor(0x00ff00)
      .setFooter({ 
        text: `Sugerido por: ${author.tag} | Aprovado por: ${interaction.user.tag}`, 
        iconURL: author.displayAvatarURL() 
      })
      .setTimestamp();

    // CORREÇÃO: Adicionar preview do arquivo/link
    if (isLink) {
      newEmbed.setDescription(`📎 **Link aprovado:** ${content}`);
      // Para links, não conseguimos anexar o conteúdo, mas podemos melhorar a descrição
    } else if (attachment) {
      newEmbed.setImage(attachment.url);
      newEmbed.setDescription(`📎 **Vídeo aprovado** (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);
    }

    // CORREÇÃO PRINCIPAL: Baixar e reenviar arquivo como anexo
    let messageData = { embeds: [newEmbed] };
    
    if (attachment && !isLink) {
      // Baixar o arquivo para reenviar como anexo
      try {
        const fetch = require('node-fetch');
        const response = await fetch(attachment.url);
        const buffer = await response.buffer();
        
        // Criar objeto de anexo
        const { AttachmentBuilder } = require('discord.js');
        const fileAttachment = new AttachmentBuilder(buffer, { 
          name: attachment.name 
        });
        
        messageData.files = [fileAttachment];
      } catch (error) {
        logger.warn(`Não foi possível baixar o arquivo, enviando como link: ${error.message}`);
        messageData.content = `📺 **Vídeo aprovado!**\n${attachment.url}`;
      }
    } else if (isLink) {
      // Para links, apenas incluir no embed
      messageData.content = `📺 **Link aprovado!**`;
    }

    // Enviar no canal de sugestões (atual)
    const approvalMessage = await interaction.channel.send(messageData);
    
    // Enviar no canal de aprovados
    const approvedChannel = client.channels.cache.get(config.channels.aprovados);
    if (approvedChannel) {
      await approvedChannel.send(messageData);
    }

    // Deletar mensagem original DEPOIS de reenviar
    await originalMessage.delete().catch((error) => {
      logger.warn(`Não foi possível deletar mensagem original: ${error.message}`);
    });
  }

  // Enviar DM para o autor
  try {
    await author.send({
      content: `✅ **Sua sugestão foi aprovada!**\n\nSua sugestão enviada em ${interaction.channel} foi aprovada pela staff.`,
      embeds: [approvalEmbed]
    });
    logger.info(`DM de aprovação enviada para ${author.tag}`);
  } catch (error) {
    logger.warn(`Não foi possível enviar DM para ${author.tag}: ${error.message}`);
  }

  // Confirmar aprovação
  await safeFollowUp(interaction, {
    content: '✅ Sugestão aprovada com sucesso!',
    flags: 64 // ephemeral
  });

  // Atualizar mensagem de sugestão com botões desabilitados
  try {
    await interaction.message.edit({
      embeds: interaction.message.embeds,
      components: [disabledRow]
    });
  } catch (error) {
    logger.warn(`Não foi possível atualizar mensagem: ${error.message}`);
  }

  logger.info(`Sugestão aprovada por ${interaction.user.tag} (ID: ${originalMessage.id})`);
}

async function handleRejection(interaction, originalMessage, client, disabledRow) {
  const author = originalMessage.author;
  
  // Criar embed de rejeição
  const rejectionEmbed = createRejectionEmbed(originalMessage, interaction.user);

  // Enviar DM para o autor
  try {
    const regrasChannel = `<#${config.channels.regras}>`;
    const rejectionTime = new Date().toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    await author.send({
      content: `❌ **Sua sugestão foi reprovada**\n\nO seu vídeo enviado às ${rejectionTime} foi reprovado. Releia as regras de envio de vídeo em ${regrasChannel}`,
      embeds: [rejectionEmbed]
    });
    logger.info(`DM de rejeição enviada para ${author.tag}`);
  } catch (error) {
    logger.warn(`Não foi possível enviar DM para ${author.tag}: ${error.message}`);
  }

  // Deletar mensagem original
  await originalMessage.delete().catch((error) => {
    logger.warn(`Não foi possível deletar mensagem original: ${error.message}`);
  });

  // Confirmar rejeição
  await safeFollowUp(interaction, {
    content: '❌ Sugestão reprovada com sucesso!',
    flags: 64 // ephemeral
  });

  // Atualizar mensagem de sugestão com botões desabilitados
  try {
    await interaction.message.edit({
      embeds: interaction.message.embeds,
      components: [disabledRow]
    });
  } catch (error) {
    logger.warn(`Não foi possível atualizar mensagem: ${error.message}`);
  }

  logger.info(`Sugestão reprovada por ${interaction.user.tag} (ID: ${originalMessage.id})`);
}