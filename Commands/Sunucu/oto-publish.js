const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../Database/otoPublish.json');
const otoPublishData = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath)) : {};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('oto-publish')
    .setDescription('Otomatik duyuru sistemini ayarlar.')
    .addSubcommand(sub =>
      sub.setName('ayarla')
        .setDescription('Duyuru kanalını ayarlar.')
        .addChannelOption(option =>
          option.setName('kanal')
            .setDescription('Kanal seç.')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('sıfırla')
        .setDescription('Otomatik duyuru sistemini sıfırlar.')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'ayarla') {
  const channel = interaction.options.getChannel('kanal');

  if (channel.type !== ChannelType.GuildAnnouncement) {
    return interaction.reply({
      content: '<a:dikkat_arviis:997074866371039322> **Bu kanal duyuru kanalı değil.**',
      flags: 64
    });
  }

  if (!otoPublishData[guildId]) {
    otoPublishData[guildId] = [];
  }

  if (otoPublishData[guildId].includes(channel.id)) {
    return interaction.reply({ content: '<a:dikkat_arviis:997074866371039322> **Bu kanal zaten listede var.**', flags: 64 });
  }

  otoPublishData[guildId].push(channel.id);
  fs.writeFileSync(dbPath, JSON.stringify(otoPublishData, null, 2));

  return interaction.reply({ content: `<:tik_arviis:1046067679884234863> Otomatik duyuru sistemi **ayarlandı** \n\n<:hashtag_arviis:1051904217478070276> ${channel}`, flags:64});
}


    if (sub === 'sıfırla') {
  if (!otoPublishData[guildId] || otoPublishData[guildId].length === 0) {
    return interaction.reply({
      content: '<a:dikkat_arviis:997074866371039322> **Ayarlanmış kanal yok.**',
      flags: 64
    });
  }

  delete otoPublishData[guildId];
  fs.writeFileSync(dbPath, JSON.stringify(otoPublishData, null, 2));

  return interaction.reply({ content: '<:tik_arviis:1046067679884234863> Otomatik duyuru sistemi **sıfırlandı.**', flags: 64});
}
  }
};
