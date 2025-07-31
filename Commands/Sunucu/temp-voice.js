const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../../Database/tempVoice.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("temp-voice")
    .setDescription("Temp Voice sistemini kurar.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option.setName("sesli-kanal")
        .setDescription("Ses kanalı seç.")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildVoice)
    ),

  async execute(interaction) {
    const voiceChannel = interaction.options.getChannel("sesli-kanal");

    const config = {
      guildId: interaction.guild.id,
      voiceChannelId: voiceChannel.id
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    await interaction.reply({
      content: "<:tik_arviis:1046067679884234863> Temp Voice sistemi **kuruldu.**",
      flags: 64
    });
  }
};