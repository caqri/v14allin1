const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../Database/roleplay.json');

function getSortedLeaderboard(limit) {
    if (!fs.existsSync(dataPath)) return [];

    const raw = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const sorted = Object.entries(raw)
        .filter(([_, value]) => typeof value.para === 'number')
        .sort((a, b) => b[1].para - a[1].para)
        .slice(0, limit);

    return sorted;
}

function getTotalPara() {
    if (!fs.existsSync(dataPath)) return 0;

    const raw = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    return Object.values(raw).reduce((sum, user) => sum + (user.para || 0), 0);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rp-zenginler')
        .setDescription('Sunucudaki zengin kişileri gösterir.')
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Kaç kişi listelensin? (varsayılan: 15)')
                .setMinValue(1)
                .setMaxValue(50)
        ),

    async execute(interaction) {
        const limit = interaction.options.getInteger('limit') || 15;

        const leaderboard = getSortedLeaderboard(limit);

        if (leaderboard.length === 0) {
            return interaction.reply({
                content: '<a:dikkat_arviis:997074866371039322> **Para verisi bulunamadı.**',
                flags: 64
            });
        }

        const iconlar = ['🥇', '🥈', '🥉', '🎖️', '🎖️'];
        const liste = await Promise.all(leaderboard.map(async ([userId, userData], index) => {
            const user = await interaction.client.users.fetch(userId).catch(() => null);
            const tag = user ? `<@${userId}>` : `<:carpi_arviis:1046067681515814912> Bilinmeyen Kişi **(** ${userId} **)**`;
            const para = userData.para.toLocaleString();
            const sıra = index + 1;
            const simge = iconlar[index] || `#${sıra}`;
            return `${simge} ${tag} ➔ **${para}** Dolar`;
        }));

        const toplamKullanici = leaderboard.length;
        const toplamPara = getTotalPara().toLocaleString();

        const embed = new EmbedBuilder()
            .setColor('Gold')
            .setThumbnail(interaction.guild.iconURL())
            .setDescription(`## Amerika Ulusal Bankası Dolar Sıralaması \n\n${liste.join('\n')} \n\n• Toplam **${toplamKullanici}** kişi sıralandı. \n• Sunucu kasasında toplam **${toplamPara} Dolar** bulunuyor.`)

        await interaction.reply({ embeds: [embed] });
    },
};
