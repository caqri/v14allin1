const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, ButtonBuilder, ActionRowBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sahte-buton')
        .setDescription('Sahte buton sistemini ayarlar.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Kanal seç')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        ),

        
    async execute(interaction) {
        const channel = interaction.options.getChannel('kanal');

        const attachmentPath = path.join(__dirname, '../../assets/Sahte Buton/nitro.gif'); 
        const attachment = new AttachmentBuilder(attachmentPath);

        const buttonRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('arviston')
                .setEmoji('<a:nitro_arviis:997610168382652528>')
                .setLabel('Yıllık Nitroyu Kap!')
                .setStyle(ButtonStyle.Success)
        );

        try {
            await channel.send({
                content: '# <a:nitroboost_arviis:1058003701496807544> Yıllık Boost Nitro\n- Hızlı ol, nitroyu al!',
                files: [attachment],
                components: [buttonRow],
            });

            await interaction.reply({
                content: '<:tik_arviis:1046067679884234863> Sahte buton ayarlandı.',
                flags: 64
            });
        } catch (error) {
            console.error("Buton mesajı gönderilirken hata:", error);
            await interaction.reply({
                content: '<:carpi_arviis:1046067681515814912> Hata! Tekrar dene.',
                flags: 64
            });
        }
    },
};
