const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../Database/roleplay.json');
const db = require(dbPath);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rp-sonrp')
    .setDescription('Kişinin en son ne zaman ve nerede Roleplay yaptığını gösterir.')
    .addUserOption(opt =>
      opt.setName('kişi')
        .setDescription('Kişi seç.')
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('kişi') || interaction.user;
    const targetId = target.id;
    const data = db[targetId];

    if (!data || !data.lastChannel || !data.lastTime) {
      return interaction.reply({
        content: `<a:dikkat_arviis:997074866371039322> <@${targetId}> **adlı kişiye ait kayıtlı veri bulunamadı.**`,
        flags: 64
      });
    }

    const timestamp = Math.floor(data.lastTime / 1000); 
    return interaction.reply({
      content: `<@${targetId}> en son <t:${timestamp}:R> <#${data.lastChannel}> kanalında Roleplay yapmış.`,
      allowedMentions: { users: [] }
    });
  }
};
