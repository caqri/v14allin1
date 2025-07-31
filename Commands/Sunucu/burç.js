const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const ayarDosyasi = path.join(__dirname, '../../Database/burcAyar.json');

const burclar = ['koc', 'boga', 'ikizler', 'yengec', 'aslan', 'basak', 'terazi', 'akrep', 'yay', 'oglak', 'kova', 'balik'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('burç')
    .setDescription('Burç sistemini ayarlar.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('ayarla')
        .setDescription('Burç yorumlarının gönderileceği kanalı, periyodu ve saati ayarlar.')
        .addChannelOption(opt =>
          opt.setName('kanal')
            .setDescription('Kanal seç.')
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setRequired(true))
        .addStringOption(opt =>
          opt.setName('periyot')
            .setDescription('Periyot seç.')
            .setRequired(true)
            .addChoices(
              { name: 'Günlük', value: 'daily' },
              { name: 'Haftalık', value: 'weekly' },
              { name: 'Aylık', value: 'monthly' }
            ))
        .addStringOption(opt =>
          opt.setName('saat')
            .setDescription('Saat (09:00)')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('sıfırla')
        .setDescription('Burç sistemini sıfırlar.'))
    .addSubcommand(sub =>
      sub.setName('rol')
        .setDescription('Burç için etiketlenecek rolü ayarlar.')
        .addStringOption(opt =>
          opt.setName('burç')
            .setDescription('Burç adı (küçük harfle, örn: kova)')
            .setRequired(true)
            .addChoices(...burclar.map(b => ({ name: b.charAt(0).toUpperCase() + b.slice(1), value: b }))))
        .addRoleOption(opt =>
          opt.setName('rol')
            .setDescription('Rol seç.')
            .setRequired(true))),
        
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    let burcAyar = {};
    if (fs.existsSync(ayarDosyasi)) {
      burcAyar = JSON.parse(fs.readFileSync(ayarDosyasi, 'utf8'));
    }

    if (sub === 'ayarla') {
      const kanal = interaction.options.getChannel('kanal');
      const periyot = interaction.options.getString('periyot');
      const saat = interaction.options.getString('saat');

      burcAyar[guildId] = {
        kanal: kanal.id,
        periyot,
        saat,
        roller: burcAyar[guildId]?.roller || {}
      };

      fs.writeFileSync(ayarDosyasi, JSON.stringify(burcAyar, null, 2), 'utf8');

      await interaction.reply({
        content: `<:tik_arviis:1046067679884234863> Burç sistemi **ayarlandı.** \n\n<:hashtag_arviis:1051904217478070276> **${kanal}** \n☀️ **${periyot}** \n<a:saat_arviis:1367655591560085535> **${saat}**`,
        flags: 64
      });

    } else if (sub === 'sıfırla') {
      if (burcAyar[guildId]) {
        delete burcAyar[guildId];
        fs.writeFileSync(ayarDosyasi, JSON.stringify(burcAyar, null, 2), 'utf8');

        await interaction.reply({
          content: `<:tik_arviis:1046067679884234863> Burç sistemi **sıfırlandı.**`,
          flags: 64
        });
      } else {
        await interaction.reply({
          content: `<a:dikkat_arviis:997074866371039322> **Sunucuda aktif burç sistemi ayarı bulunmuyor.**`,
          flags: 64
        });
      }
    } else if (sub === 'rol') {
      const burc = interaction.options.getString('burç');
      const rol = interaction.options.getRole('rol');

      if (!burcAyar[guildId]) {
        return await interaction.reply({
          content: `<a:dikkat_arviis:997074866371039322> **Önce \`/burç ayarla\` komutuyla sistemi kur.**.`,
          flags: 64
        });
      }

      burcAyar[guildId].roller = burcAyar[guildId].roller || {};
      burcAyar[guildId].roller[burc] = rol.id;

      fs.writeFileSync(ayarDosyasi, JSON.stringify(burcAyar, null, 2), 'utf8');

      await interaction.reply({
        content: `<:tik_arviis:1046067679884234863> **${burc.charAt(0).toUpperCase() + burc.slice(1)}** burcu için etiketlenecek rol ${rol} olarak **ayarlandı.**`,
        flags: 64
      });
    }
  }
};
