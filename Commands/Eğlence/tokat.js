const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tokat')
    .setDescription('Etiketlenen kişiyi tokatlar.')
    .addUserOption(option =>
      option.setName('kişi').setDescription('Kişi seç.').setRequired(true)
    ),

  async execute(interaction) {
    const hedef = interaction.options.getUser('kişi');
    const tokatlayan = interaction.user;

    if (hedef.id === tokatlayan.id) {
      return interaction.reply({
        content: '<a:dikkat_arviis:997074866371039322> **Kendi kendini tokatlayamazsın...**',
        flags: 64
      });
    }

    const gifler = ['tokat1.gif', 'tokat2.gif', 'tokat3.gif', 'tokat4.gif', 'tokat5.gif', 'tokat6.gif'];
    const rastgeleGif = gifler[Math.floor(Math.random() * gifler.length)];
    const dosyaYolu = path.join(__dirname, '..', '..', 'assets', 'Eğlence', rastgeleGif);

    if (!fs.existsSync(dosyaYolu)) {
      return interaction.reply({ content: '<a:dikkat_arviis:997074866371039322> **GIF dosyası bulunamadı.**', flags: 64 });
    }

    await interaction.deferReply();

    try {
      await interaction.editReply({
        content: `🤬 <@${tokatlayan.id}> <:sadesagok_arviis:1109797490665996349> <@${hedef.id}> kişisine sağlam bir tokat attı!`,
        files: [dosyaYolu]
      });
    } catch (error) {
      console.error('Interaction hatası:', error);
      try {
        await interaction.editReply({ content: '<a:dikkat_arviis:997074866371039322> **Mesaj gönderilirken hata oluştu.**' });
      } catch (innerError) {
        console.error('Hata mesajı gönderilemedi:', innerError);
      }
    }
  }
};
