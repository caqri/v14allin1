const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../Database/roleplay.json');

function loadData() {
    if (!fs.existsSync(dataPath)) return {};
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function saveData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
}

function getSortedUserIds(data) {
    return Object.entries(data)
        .sort((a, b) => b[1].para - a[1].para)
        .map(([id]) => id);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rp-bakiye')
        .setDescription('Kişinin banka bakiyesini görüntüler.')
        .addUserOption(option =>
            option.setName('kişi')
                .setDescription('Kişi seç.')
                .setRequired(false)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('kişi') || interaction.user;
        const userId = targetUser.id;

        const data = loadData();
        if (!data[userId]) {
            data[userId] = { para: 0, sonişlem: 'Henüz işlem yapılmamış.' };
            saveData(data);
        }

        const para = data[userId].para || 0;
        const sonIslem = data[userId].sonişlem || 'Henüz işlem yapılmamış.';

        const sortedIds = getSortedUserIds(data);
        const rank = sortedIds.indexOf(userId) + 1;

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setThumbnail(targetUser.displayAvatarURL())
            .setDescription(`## Amerika Ulusal Bankası \n\n<@${userId}> adlı kişinin banka hesabında **${para.toLocaleString()} Dolar** bulunuyor.

🏅 **Zenginlik sıralaması:** \`${rank === 0 ? 'Sıralama dışı' : `${rank}.`}\`


**Bankada görünen en son işlem:**\n\`\`\`fix\n${sonIslem}\n\`\`\``)
            .setImage('https://galeri13.uludagsozluk.com/655/hoppidi-hoppidi-ziplayan-dolar-gifleri_1723065.gif')

        await interaction.reply({ embeds: [embed] });
    },
};
