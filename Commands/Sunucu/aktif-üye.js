const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { generateEmbed } = require('../../Utils/embedGenerator'); 
const path = require('path');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('aktif-üye')
    .setDescription('Aktif üye sistemini ayarlar.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('ayarla')
        .setDescription('Aktif üye sistemini ayarlar.')
        .addChannelOption(opt =>
          opt.setName('kanal')
            .setDescription('Kanal seç.')
            .setRequired(true))
        .addRoleOption(opt =>
          opt.setName('rol')
            .setDescription('Rol seç.')
            .setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('seç')
        .setDescription('Kişi seç.')
        .addUserOption(opt =>
          opt.setName('kişi')
            .setDescription('Kişi seç.')
            .setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('sıfırla')
        .setDescription('Tüm aktif üye verilerini sıfırlar.')),

  async execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const dataPath = path.join(__dirname, '..', '..', 'Database', 'aktifUye.json');

  if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify({ puanlar: {} }, null, 2));
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  if (sub === 'ayarla') {
    const kanal = interaction.options.getChannel('kanal');
    const rol = interaction.options.getRole('rol');

    data.kanal = kanal.id;
    data.rol = rol.id;

    const embed = generateEmbed(data); 
    const msg = await kanal.send({ embeds: [embed] });

    data.mesaj = msg.id;
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

    return interaction.reply({ content: '<:tik_arviis:1046067679884234863> Sistem **ayarlandı.**', flags: 64 });
  }

  if (sub === 'seç') {
    const üye = interaction.options.getMember('kişi'); 
    data.aktifUye = üye.id;

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

    try {
        const kanal = await interaction.guild.channels.fetch(data.kanal);
        const mesaj = await kanal.messages.fetch(data.mesaj);
        const newEmbed = generateEmbed(data);
        await mesaj.edit({ embeds: [newEmbed] });

        const rol = interaction.guild.roles.cache.get(data.rol);
        if (rol) {
            await üye.roles.add(rol);
        }
    } catch (err) {
        console.error('Embed veya rol güncellenemedi:', err.message);
    }

    return interaction.reply({
        content: `<:cute_active_arviis:1374020692944879687> Haftanın aktif üyesi ${üye} olarak **seçildi.**`,
        flags: 64
    });
}

  if (sub === 'sıfırla') {
    Object.keys(data).forEach(key => {
        if (key.startsWith('puan_')) {
            delete data[key];
        }
    });
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return interaction.reply({ content: '<:tik_arviis:1046067679884234863> Puan verileri **sıfırlandı.**', flags: 64 });
}
}
};
