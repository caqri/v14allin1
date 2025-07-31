const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rp-para')
        .setDescription('Para işlemleri.')
        .addSubcommand(sub =>
            sub.setName('gönder')
                .setDescription('Kişiye para gönder.')
                .addUserOption(opt => opt.setName('kişi').setDescription('Kişi seç.').setRequired(true))
                .addIntegerOption(opt => opt.setName('miktar').setDescription('Miktar gir.').setRequired(true))
                .addStringOption(opt => opt.setName('not').setDescription('Not gir.').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('ekle')
                .setDescription('Kişiye para ekle.')
                .addUserOption(opt => opt.setName('kişi').setDescription('Kişi seç.').setRequired(true))
                .addIntegerOption(opt => opt.setName('miktar').setDescription('Miktar gir.').setRequired(true))
                .addStringOption(opt => opt.setName('not').setDescription('Not gir.').setRequired(true))
                .addChannelOption(opt => opt.setName('log').setDescription('Kanal seç.').setRequired(true))
        )

        .addSubcommand(sub =>
            sub.setName('çıkar')
                .setDescription('Kişiden para çıkar.')
                .addUserOption(opt => opt.setName('kişi').setDescription('Kişi seç.').setRequired(true))
                .addIntegerOption(opt => opt.setName('miktar').setDescription('Miktar gir.').setRequired(true))
                .addStringOption(opt => opt.setName('not').setDescription('Not gir.').setRequired(true))
                .addChannelOption(opt => opt.setName('log').setDescription('Kanal seç.').setRequired(true))
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

if ((sub === 'ekle' || sub === 'çıkar') &&
        !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
            content: '<a:dikkat_arviis:997074866371039322> **Bu komutu kullanmak için yetkin yok.**',
            flags: 64
        });
    }

        const user = interaction.options.getUser('kişi');
        const miktar = interaction.options.getInteger('miktar');
        const not = interaction.options.getString('not') || 'Bulunamadı.';
        const logChannel = interaction.options.getChannel('log');
        const author = interaction.user;

        if (miktar <= 0)
            return interaction.reply({ content: '<a:dikkat_arviis:997074866371039322> **Miktar 0 veya daha az olamaz.**', flags: 64 });

        const data = loadData();

        if (!data[user.id]) data[user.id] = { para: 0, sonişlem: '' };
        if (!data[author.id]) data[author.id] = { para: 0, sonişlem: '' };

        const eskiPara = data[user.id].para;

        if (sub === 'gönder') {
            if (user.id === author.id)
                return interaction.reply({ content: '<a:dikkat_arviis:997074866371039322> **Kendine para gönderemezsin.**', flags: 64 });

            if (data[author.id].para < miktar)
                return interaction.reply({ content: `<:carpi_arviis:1046067681515814912> **Yetersiz bakiye.** **(** Bakiyen: **${data[author.id].para.toLocaleString()} Dolar** **)**`, flags: 64 });

            data[author.id].para -= miktar;
            data[user.id].para += miktar;

            data[author.id].sonişlem = `[Para Gönderildi] | [${user.username}] | -${miktar.toLocaleString()}`;
            data[user.id].sonişlem = `[Para Alındı] | [${author.username}] | +${miktar.toLocaleString()}`;

            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setThumbnail(user.displayAvatarURL())
                .setDescription(
                    `## Amerika Ulusal Bankası \n\n` +
                    `**Gönderen ➔** <@${author.id}> \n💰 ${eskiPara.toLocaleString()} ➔ ${data[author.id].para.toLocaleString()} \n\n` +
                    `**Alıcı ➔** <@${user.id}> \n💰 ${eskiPara.toLocaleString()} ➔ ${data[user.id].para.toLocaleString()} \n\n\n📜 İşlem Notu ➔ **${not}**`
                );

            await interaction.reply({ content: `<:tik_arviis:1046067679884234863> <@${user.id}> adlı kişiye **${miktar.toLocaleString()} Dolar** gönderildi.`, embeds: [embed] });

        } else if (sub === 'ekle') {
            data[user.id].para += miktar;
            data[user.id].sonişlem = `[Para Eklendi] | [${author.username}] | +${miktar.toLocaleString()}`;

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setThumbnail(user.displayAvatarURL())
                .setDescription(`## Amerika Ulusal Bankası \n\n<:tik_arviis:1046067679884234863> <@${user.id}> adlı kişiye **${miktar.toLocaleString()} Dolar** eklendi. \n\n💰 Yeni Bakiye: **${data[user.id].para.toLocaleString()} Dolar** \n\n\n📜 İşlem Notu ➔ **${not}**`)

            await interaction.reply({ embeds: [embed] });

        } else if (sub === 'çıkar') {
            if (data[user.id].para < miktar)
                return interaction.reply({ content: `<:carpi_arviis:1046067681515814912> <@${user.id}> adlı kişinin bakiyesi **yetersiz.**`, flags: 64 });

            data[user.id].para -= miktar;
            data[user.id].sonişlem = `[Para Çıkarıldı] | [${author.username}] | -${miktar.toLocaleString()}`;

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setThumbnail(user.displayAvatarURL())
                .setDescription(`## Amerika Ulusal Bankası \n\n<:tik_arviis:1046067679884234863> <@${user.id}> adlı kişiden **${miktar.toLocaleString()} Dolar** çıkarıldı. \n\n💰 Yeni Bakiye: **${data[user.id].para.toLocaleString()} Dolar** \n\n\n📜 İşlem Notu ➔ **${not}**`)

            await interaction.reply({ embeds: [embed] });
        }

        saveData(data);

        
        if (logChannel && logChannel.isTextBased()) {
            const logEmbed = new EmbedBuilder()
                .setColor('Blurple')
                .setDescription(`## Para Kayıt Sistemi \n\n\`${sub.toUpperCase()}\` işlemi: <@${author.id}> ➔ <@${user.id}> için **${miktar.toLocaleString()} Dolar**`)

            logChannel.send({ embeds: [logEmbed] });
        }
    }
};
