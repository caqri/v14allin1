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
        .setName('maaş-yatır')
        .setDescription('Seçilen role toplu maaş yatırır.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addRoleOption(option =>
            option.setName('rol')
                .setDescription('Rol seç.')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('miktar')
                .setDescription('Miktar gir.')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('log')
                .setDescription('Kanal seç')
                .setRequired(true)
        ),
        
    async execute(interaction) {
        const rol = interaction.options.getRole('rol');
        const miktar = interaction.options.getInteger('miktar');
        const logChannel = interaction.options.getChannel('log'); 
        const members = rol.members;
        const yatıran = interaction.user;

        if (members.size === 0) {
            return interaction.reply({
                content: `Bu rolde hiç üye yok.`,
                flags: 64
            });
        }

        const data = loadData();
        let sayac = 0;

        members.forEach(member => {
            const userId = member.user.id;

            if (!data[userId]) {
                data[userId] = { para: 0, sonişlem: '' };
            }

            data[userId].para += miktar;
            data[userId].sonişlem = `${rol.name} maaşı alındı (+${miktar.toLocaleString()} Dolar)`;

            sayac++;
        });

        saveData(data);

        if (logChannel && logChannel.isTextBased()) {
            const logEmbed = new EmbedBuilder()
                .setColor('Green')
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription(`## Amerika Ulusal Bankası \n\n<a:ucanpara_arviis:998627920790700084> \`Maaş Yatırıldı\` → <@&${rol.id}> rolündekilere <@${yatıran.id}> tarafından **${miktar.toLocaleString()} Dolar** yatırıldı. \n\nRoldeki kişi sayısı: **${sayac}**`)

            logChannel.send({ embeds: [logEmbed] }).catch(console.error);
        }

        const embed = new EmbedBuilder()
            .setColor(0x00ff44)
            .setDescription(`## Amerika Ulusal Bankası \n\n<a:doviz_arviis:1069632098287235202> <@&${rol.id}> rolündeki **${sayac}** kişiye **${miktar.toLocaleString()} Dolar** yatırıldı.`)
            .setImage('https://galeri13.uludagsozluk.com/655/hoppidi-hoppidi-ziplayan-dolar-gifleri_1723065.gif')

        await interaction.reply({ embeds: [embed] });
    },
};
