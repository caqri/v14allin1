const { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dm-duyuru")
    .setDescription("Sunucudaki herkese özel mesaj gönderir.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const sahipID = "216222397349625857";
    if (interaction.user.id !== sahipID) {
      return interaction.reply({
        content: "<a:dikkat_arviis:997074866371039322> **Bu komutu sadece <@216222397349625857> kullanabilir.**",
        flags: 64
      });
    }

    const modal = new ModalBuilder()
      .setCustomId("dmDuyuruModal")
      .setTitle("DM Duyuru Mesajı");

    const mesajInput = new TextInputBuilder()
      .setCustomId("duyuruMesaji")
      .setLabel("Gönderilecek Mesaj")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(mesajInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  }
};