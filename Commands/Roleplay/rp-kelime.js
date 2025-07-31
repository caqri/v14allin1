const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const dbPath = path.join(__dirname, '../../Database/roleplay.json');
const db = require(dbPath);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rp-kelime')
    .setDescription('Kişinin RP istatistiklerini göster.')
    .addUserOption(opt =>
      opt.setName('kişi')
        .setDescription('Kişi seç.')
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('kişi') || interaction.user;
    const userId = user.id;
    const data = db[userId] || { rp: 0, xp: 0 };

    return interaction.reply({
      embeds: [{
        color: 0x0099ff,
        author: { name: user.username, icon_url: user.displayAvatarURL() },
        description: `## 📜 Roleplay İstatistikleri \n\n<:sadesagok_arviis:1109797490665996349> Haftalık: **${data.rp} kelime** \n<:sadesagok_arviis:1109797490665996349> Toplam: **${data.xp} kelime**`,
      }]
    });
  }
};