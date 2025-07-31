const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../Database/roleplay.json');
const db = require(dbPath);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleplay')
    .setDescription('Roleplay komutlarını yönetir.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommandGroup(group =>
      group.setName('ekle')
        .setDescription('Kişiye Roleplay verisi ekler.')
        .addSubcommand(sub =>
          sub.setName('haftalık')
            .setDescription('Kişinin haftalık Roleplay verisini arttırır.')
            .addUserOption(opt => opt.setName('kişi').setDescription('Kişi seç.').setRequired(true))
            .addIntegerOption(opt => opt.setName('miktar').setDescription('Miktar gir.').setRequired(true)))
        .addSubcommand(sub =>
          sub.setName('toplam')
            .setDescription('Kişinin toplam Roleplay verisini arttırır.')
            .addUserOption(opt => opt.setName('kişi').setDescription('Kişi seç.').setRequired(true))
            .addIntegerOption(opt => opt.setName('miktar').setDescription('Miktar gir.').setRequired(true)))
        .addSubcommand(sub =>
          sub.setName('ikiside')
            .setDescription('Kişinin hem haftalık hem toplam verisini arttırır.')
            .addUserOption(opt => opt.setName('kişi').setDescription('Kişi seç.').setRequired(true))
            .addIntegerOption(opt => opt.setName('miktar').setDescription('Miktar gir.').setRequired(true))))
    .addSubcommandGroup(group =>
      group.setName('kategori')
        .setDescription('Roleplay kategorilerini ayarlar.')
        .addSubcommand(sub =>
          sub.setName('ekle')
            .setDescription('Roleplay kategorisi ekler.')
            .addChannelOption(opt => opt.setName('kategori').setDescription('Kategori seç.').setRequired(true)))
        .addSubcommand(sub =>
          sub.setName('çıkar')
            .setDescription('Kategorisiyi Roleplayden çıkarır.')
            .addChannelOption(opt => opt.setName('kategori').setDescription('Kategori seç.').setRequired(true))))
    .addSubcommand(sub =>
      sub.setName('sıfırla')
        .setDescription('Haftalık Roleplay verilerini sıfırlar.'))
        .addSubcommand(sub =>
  sub.setName('log-kanal-ayarla')
    .setDescription('Roleplay loglarının gönderileceği kanalı ayarlar.')
    .addChannelOption(opt => opt.setName('kanal').setDescription('Kanal seç.').setRequired(true))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const group = interaction.options.getSubcommandGroup(false);
    const user = interaction.options.getUser('kişi') || interaction.user;
    const amount = interaction.options.getInteger('miktar') || 0;
    const channel = interaction.options.getChannel('kategori');
    const userId = user.id;
    const logChannel = interaction.options.getChannel('kanal');
    
    if (group === 'ekle') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '<a:dikkat_arviis:997074866371039322> **Bu komutu kullanamazsın.**', flags: 64 });
      }

      if (!db[userId]) db[userId] = { rp: 0, xp: 0 };

      if (sub === 'haftalık') db[userId].rp += amount;
      if (sub === 'toplam') db[userId].xp += amount;
      if (sub === 'ikiside') {
        db[userId].rp += amount;
        db[userId].xp += amount;
      }

      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
      return interaction.reply({ content: `<:tik_arviis:1046067679884234863> <@${userId}> kişisine **${amount}** kelime **eklendi.**` });
    }

    if (group === 'kategori') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '<a:dikkat_arviis:997074866371039322> **Bu komutu kullanamazsın.**', flags: 64 });
      }

      const categoryId = channel.id;
      db.kategoriler = db.kategoriler || [];

      if (sub === 'ekle') {
        if (!db.kategoriler.includes(categoryId)) {
          db.kategoriler.push(categoryId);
        }
      }

      if (sub === 'çıkar') {
        db.kategoriler = db.kategoriler.filter(id => id !== categoryId);
      }

      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
      return interaction.reply({ content: `<:hashtag_arviis:1051904217478070276> **${channel.name}** Roleplay kategorisine ${sub === 'ekle' ? '**eklendi.**' : '**çıkarıldı.**'}.` });
    }

if (sub === 'log-kanal-ayarla') {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: '<a:dikkat_arviis:997074866371039322> **Bu komutu kullanamazsın.**', flags: 64 });
  }

  const logChannel = interaction.options.getChannel('kanal');
  if (!logChannel) {
    return interaction.reply({ content: '<a:dikkat_arviis:997074866371039322> **Geçerli bir kanal gir.**', flags: 64 });
  }

  db.logKanal = logChannel.id;
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  return interaction.reply({ content: `<:tik_arviis:1046067679884234863> Log kanalı **${logChannel.name}** olarak **ayarlandı.**` });
}

    if (sub === 'sıfırla') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '<a:dikkat_arviis:997074866371039322> **Bu komutu kullanamazsın.**', flags: 64 });
      }

      Object.keys(db).forEach(uid => {
        if (db[uid] && typeof db[uid] === 'object') db[uid].rp = 0;
      });

      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
      return interaction.reply({ content: '<:tik_arviis:1046067679884234863> Haftalık Roleplay verileri **sıfırlandı.**' });
    }
  }
};