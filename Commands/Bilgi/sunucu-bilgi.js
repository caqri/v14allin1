const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sunucu-bilgi')
        .setDescription('Sunucu hakkında bilgi verir.'),

    async execute(interaction) {
        const guild = interaction.guild;
        const owner = await guild.fetchOwner();
        const verificationLevel = guild.verificationLevel;
        const roles = guild.roles.cache.size;
        const channels = guild.channels.cache.size;
        const emojis = guild.emojis.cache.size;
        const afkChannel = guild.afkChannel ? guild.afkChannel.name : 'Ayarlanmamış.';
        const afkTimeout = guild.afkTimeout / 60;

        const totalMembers = guild.memberCount;
        const botCount = guild.members.cache.filter(m => m.user.bot).size;
        const humanCount = totalMembers - botCount;

        const boostCount = guild.premiumSubscriptionCount;
        const boostTier = guild.premiumTier;

        const bannerURL = guild.bannerURL({ size: 1024, extension: 'png' });

        const embed = new EmbedBuilder()
            .setDescription(`## ${guild.name} | Sunucu Bilgisi`)
            .setColor(0x664dd6)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: "📅 Oluşturulma", value: `<t:${parseInt(guild.createdAt / 1000)}:D>`, inline: true },
                { name: "<a:lgbt_arviis:1051167644205727744> Sunucu Sahibi", value: `${owner}`, inline: true },
                { name: "🌍 Sunucu Dili", value: guild.preferredLocale, inline: true },

                { name: "<:uye_arviis:1052278326535917718> Üye Sayısı [Botlu]", value: `${totalMembers}`, inline: true },
                { name: "<:kullanici_arviis:997610103865888768> Üye Sayısı [Botsuz]", value: `${humanCount}`, inline: true },
                { name: "<:mdeveloper_arviis:1070318193903669299> Botlar", value: `${botCount}`, inline: true },

               
                { name: "<:ampul_arviis:1052278328280764536> Rol Sayısı", value: `${roles}`, inline: true },
                { name: "<:hashtag_arviis:1051904217478070276> Kanal Sayısı", value: `${channels}`, inline: true },
                { name: "<:konfeti_arviis:1051904858602623126> Emoji Sayısı", value: `${emojis}`, inline: true },

                { name: "💤 AFK Kanalı", value: afkChannel, inline: true },
                { name: "<a:saat_arviis:1367655591560085535> AFK Süresi", value: `${afkTimeout} Dakika`, inline: true },
                { name: "<:info_arviis:997609746410504282> Doğrulama", value: `${verificationLevel} . Seviye`, inline: true },

                { name: "<a:nitroboost_arviis:1058003701496807544> Toplam Boost & Seviye", value: `**${boostCount}** Boost | **${boostTier}.** Seviye`, inline: true },

                { name: "<:discord_arviis:997610089651384342> Sunucu ID", value: `${guild.id}`, inline: false },
            );

        if (bannerURL) {
    embed.setImage(bannerURL);
} else {
    embed.setImage('https://dummyimage.com/800x200/2b2d31/ffffff&text=Sunucunun+Bannerı+Yok');
}

        await interaction.reply({ embeds: [embed] });
    },
};
