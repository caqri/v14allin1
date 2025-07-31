const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sunucudan-at")
        .setDescription("Belirtilen kişiyi sunucudan atar.")
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option =>
            option.setName("kişi")
                .setDescription("Kişi seç.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("sebep")
                .setDescription("Sebep gir.")
                .setRequired(true)
        ),

    async execute(interaction) {
        const { guild, member: komutuKullanan, options } = interaction;

        const user = options.getUser("kişi");
        const reason = options.getString("sebep") || "Sebep belirtilmedi.";

        const member = await guild.members.fetch(user.id).catch(() => null);
        const ikon = user.displayAvatarURL({ dynamic: true, size: 2048 });

        if (!member) {
            return interaction.reply({
                content: "<a:dikkat_arviis:997074866371039322> **Bu kişi sunucuda bulunamıyor.**",
                flags: 64
            });
        }

        if (user.id === guild.ownerId) {
            return interaction.reply({
                content: "<a:dikkat_arviis:997074866371039322> **Sunucu sahibini atamazsın.**",
                flags: 64
            });
        }

        if (member.roles.highest.position >= komutuKullanan.roles.highest.position && komutuKullanan.id !== guild.ownerId) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("<:ban_arviis:1370897399261823016> Yetki Hatası")
                        .setDescription(`<a:dikkat_arviis:997074866371039322> **${user.username}** kişisinin rolü seninkine eşit veya daha yüksek.`)
                        .setColor(0xff4c4c)
                        .setThumbnail(guild.iconURL({ dynamic: true }))
                ],
                flags: 64
            });
        }

        if (guild.members.me.roles.highest.position <= member.roles.highest.position) {
            return interaction.reply({
                content: "<a:dikkat_arviis:997074866371039322> **Bu kişiyi atmak için yeterli yetkim yok.**",
                flags: 64
            });
        }

        try {
            await member.kick(reason);

            const kickEmbed = new EmbedBuilder()
                .setAuthor({ name: `"${user.username}" sunucudan atıldı.`, iconURL: guild.iconURL({ dynamic: true }) })
                .setColor(0x57F287)
                .setThumbnail(ikon)
                .addFields(
                    { name: "<:kullanici_arviis:997610103865888768> Atılan Kişi", value: `${user}`, inline: true },
                    { name: "<:hashtag_arviis:1051904217478070276> Sebep", value: reason, inline: true },
                    { name: "<:kalkan_arviis:1051904216060407929> Atan", value: `${interaction.user}`, inline: false }
                )

            await interaction.reply({ embeds: [kickEmbed] });

            await user.send(`<:ban_arviis:1370897399261823016> **${guild.name}** sunucusundan **"${reason}"** sebebiyle atıldın.`)
                .catch(() => {});

        } catch (err) {
            console.error("Kick Hatası:", err);
            return interaction.reply({
                content: "<a:dikkat_arviis:997074866371039322> **Kişi atılamadı.**",
                flags: 64
            });
        }
    }
};
