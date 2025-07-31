const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("temizle")
        .setDescription("Belirtilen sayı kadar mesaj temizler.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option =>
            option.setName("sayı")
                .setDescription("Silinecek mesaj sayısı (1-100)")
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName("kişi")
                .setDescription("Kişi seç.")
                .setRequired(false)
        ),

    async execute(interaction) {
        const { channel, options, guild } = interaction;

        const miktar = options.getInteger("sayı");
        const hedefKullanici = options.getUser("kişi");

        const mesajlar = await channel.messages.fetch({ limit: miktar + 10 });
        const embed = new EmbedBuilder().setColor(0x337fb2);

        if (hedefKullanici) {
            const filtrelenmisMesajlar = mesajlar
                .filter(msg => msg.author.id === hedefKullanici.id)
                .first(miktar);

            if (filtrelenmisMesajlar.length === 0) {
                return interaction.reply({
                    content: `<a:dikkat_arviis:997074866371039322> **${hedefKullanici.username}** adlı kişinin son ${miktar} mesajı içinde silinebilir mesaj bulunamadı.`,
                    flags: 64
                });
            }

            await channel.bulkDelete(filtrelenmisMesajlar, true)
                .then(silinen => {
                    embed.setDescription(`<:cop_arviis:1112056619711352932> **${hedefKullanici.username}** kişisine ait **${silinen.size} mesaj** kanaldan temizlendi.`);
                    interaction.reply({ embeds: [embed] });
                })
                .catch(err => {
                    interaction.reply({
                        content: "<a:dikkat_arviis:997074866371039322> **14 günden eski mesajlar silinemez.**",
                        flags: 64
                    });
                });

        } else {
            await channel.bulkDelete(miktar, true)
                .then(silinen => {
                    embed.setDescription(`<:cop_arviis:1112056619711352932> **${silinen.size} mesaj** kanaldan temizlendi.`);
                    interaction.reply({ embeds: [embed] });
                })
                .catch(err => {
                    interaction.reply({
                        content: "<a:dikkat_arviis:997074866371039322> **14 günden eski mesajlar silinemez.**",
                        flags: 64
                    });
                });
        }
    }
};
