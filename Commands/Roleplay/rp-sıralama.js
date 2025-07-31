const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../Database/roleplay.json');
const db = require(dbPath);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rp-sıralama')
    .setDescription('Roleplay sıralamasını gösterir.')
    .addStringOption(opt =>
      opt.setName('liste')
        .setDescription('Liste türü seç.')
        .setRequired(true)
        .addChoices(
          { name: 'Haftalık', value: 'haftalık' },
          { name: 'Toplam', value: 'toplam' }
        )
    )
    .addIntegerOption(opt =>
      opt.setName('limit')
        .setDescription('Kaç kişilik sıralama?')
    ),

  async execute(interaction) {
    const liste = interaction.options.getString('liste');
    const limit = interaction.options.getInteger('limit') || 15;

    const sorted = Object.entries(db)
      .filter(([_, data]) => typeof data === 'object' && data !== null && ('rp' in data || 'xp' in data))
      .sort((a, b) => (liste === 'haftalık' ? b[1].rp - a[1].rp : b[1].xp - a[1].xp))
      .slice(0, limit);

    const text = sorted.map(([id, data], i) =>
      `\`${i + 1}.\` <@${id}> ➔ **${liste === 'haftalık' ? data.rp : data.xp}** kelime`
    ).join('\n') || '<:carpi_arviis:1046067681515814912> Veri **yok.**';

    return interaction.reply({
      embeds: [{
        title: `${liste === 'haftalık' ? 'Haftalık' : 'Toplam'} RP Sıralaması`,
        description: text,
        color: 0x00aa88
      }]
    });
  }
};
