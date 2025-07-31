const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../Database/destek.json');

function loadDB() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('destek-sistemi')
    .setDescription('Destek sistemini ayarlar.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('destek-kanalı')
        .setDescription('Destek kanalını ayarlar.')
        .addChannelOption(opt =>
          opt.setName('kanal').setDescription('Kanal seç.').setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('sıfırla')
        .setDescription('Destek sistemini sıfırlar.')
    )
    .addSubcommand(sub =>
      sub.setName('yetkili-rolü')
        .setDescription('Destek taleplerinde etiketlenecek yetkili rolünü ayarlar.')
        .addRoleOption(opt =>
          opt.setName('rol').setDescription('Rol seç.').setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('transcript-log-kanalı')
        .setDescription('Kapatılan destek taleplerinin loglarının gideceği kanalı ayarlar.')
        .addChannelOption(opt =>
          opt.setName('kanal').setDescription('Kanal seç.').setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('destek-kategorisi')
        .setDescription('Açılacak destek kanallarının kategorisini ayarlar.')
        .addChannelOption(opt =>
          opt.setName('kategori').setDescription('Kategori seç.').setRequired(true)
        )
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const sub = interaction.options.getSubcommand();
    const db = loadDB();

    if (!db[guildId]) db[guildId] = { activeTickets: {} };

    if (sub === 'destek-kanalı') {
      const kanal = interaction.options.getChannel('kanal');
      db[guildId].supportChannel = kanal.id;
      saveDB(db);

      const embed = new EmbedBuilder()
        .setDescription('## <a:elsallama_arviis:1048619375655133255> Merhaba! \n- Aşağıdaki menüden destek talebi oluşturacağın konu için seçim yapabilirsin. \n  - Aradığın seçim aşağıda yoksa `Diğer` kategorisini kullanabilirsin.')
        .setColor('Blurple')
        .setThumbnail(interaction.guild.iconURL());

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('destek_menu')
          .setPlaceholder('Destek konusunu buradan seçebilirsin.')
          .addOptions([
            { label: 'Genel Destek', value: 'genel', description: 'Genel destek için bu kısımdan destek oluşturabilirsin.', emoji: "<:sadesagok_arviis:1109797490665996349>" },
            { label: 'Şikayet', value: 'şikayet', description: 'Şikayetin varsa bu kısımdan destek oluşturabilirsin.', emoji: "<:sadesagok_arviis:1109797490665996349>" },
            { label: 'Diğer', value: 'diğer', description: 'Diğer konular için bu kısımdan destek oluşturabilirsin.', emoji: "<:sadesagok_arviis:1109797490665996349>" }
          ])
      );

      await kanal.send({ embeds: [embed], components: [row] });
      await interaction.reply(`<:tik_arviis:1046067679884234863> Destek kanalı ${kanal} olarak **ayarlandı.**`);
    }

    else if (sub === 'yetkili-rolü') {
  const role = interaction.options.getRole('rol');
  db[guildId].supportRole = role.id;
  saveDB(db);
  await interaction.reply(`<:tik_arviis:1046067679884234863> Destek yetkilisi rolü ${role} olarak **ayarlandı.**`);
}

    else if (sub === 'transcript-log-kanalı') {
      const kanal = interaction.options.getChannel('kanal');
      db[guildId].logChannel = kanal.id;
      saveDB(db);
      await interaction.reply(`<:tik_arviis:1046067679884234863> Transcript log kanalı ${kanal} olarak **ayarlandı.**`);
    }

    else if (sub === 'destek-kategorisi') {
      const kategori = interaction.options.getChannel('kategori');
      if (kategori.type !== 4) {
        return await interaction.reply('<a:dikkat_arviis:997074866371039322> **Kategori kanalı seç.**');
      }
      db[guildId].categoryId = kategori.id;
      saveDB(db);
      await interaction.reply(`<:tik_arviis:1046067679884234863> Destek kategorisi ${kategori.name} olarak **ayarlandı.**`);
    }

    else if (sub === 'sıfırla') {
      if (db[guildId]) {
        delete db[guildId];
        saveDB(db);
        await interaction.reply('<:tik_arviis:1046067679884234863> Destek sistemi **sıfırlandı.**');
      } else {
        await interaction.reply('<a:dikkat_arviis:997074866371039322> **Bu sunucuda ayarları destek sistemi bulunamadı.**');
      }
    }
  }
};

client.on('interactionCreate', async interaction => {
  if (interaction.isStringSelectMenu() && interaction.customId === 'destek_menu') {
    const db = loadDB();
    const guildId = interaction.guild.id;
    const categoryId = db[guildId]?.categoryId;
    const supportRole = db[guildId]?.supportRole;

    if (!categoryId || !supportRole) {
      return interaction.reply({ content: '<a:dikkat_arviis:997074866371039322> **Destek sistemi ayarlı değil.**', flags: 64 });
    }

    db[guildId].activeTickets = db[guildId].activeTickets || {};
    if (db[guildId].activeTickets[interaction.user.id]) {
      return interaction.reply({ content: '<a:dikkat_arviis:997074866371039322> **Zaten açık bir destek talebin var.**', flags: 64 });
    }

    const konu = interaction.values[0];
    const channelName = `${konu}-destek-${interaction.user.username}`;
    const channel = await interaction.guild.channels.create({
      name: channelName,
      type: 0,
      parent: categoryId,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: ['ViewChannel'] },
        { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
        { id: supportRole, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
      ],
    });

    db[guildId].activeTickets[interaction.user.id] = channel.id;
    saveDB(db);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('destek_kapat')
        .setLabel('Talebi Kapat')
        .setEmoji('<:kapat_arviis:1051904224113471599>')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('kisi_ekle')
        .setLabel('Kanala Kişi Ekle')
        .setEmoji("<:uye_arviis:1052278326535917718>")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('kisi_cikar')
        .setLabel('Kanaldan Kişi Çıkar')
        .setEmoji("<:kullanici_arviis:997610103865888768>")
        .setStyle(ButtonStyle.Secondary)
    );

    const embed = new EmbedBuilder()
    .setTitle(`${interaction.user.globalName} [${interaction.user.username}] \n${interaction.user.id}`)
      .setDescription(`<a:elsallama_arviis:1048619375655133255> Merhaba **${interaction.user}** \n\n- Yetkililer müsait olduğunda seninle ilgilenecek. Sabırlı ol ve kimseyi boş yere etiketleme.`)
      .setThumbnail(interaction.user.displayAvatarURL())
      .setColor('Blurple');

    await channel.send({
      content: `<@&${supportRole}>`,
      embeds: [embed],
      components: [row]
    });

    await interaction.reply({ content: `<:tik_arviis:1046067679884234863> Destek kanalın **açıldı:** ${channel}`, flags: 64 });
  }

  if (interaction.isButton()) {
    const db = loadDB();
    const guildId = interaction.guild.id;
    const supportRole = db[guildId]?.supportRole;

    if (interaction.customId === 'destek_kapat') {
      const logChannelId = db[guildId]?.logChannel;

      if (!logChannelId) {
        return interaction.reply({ content: '<a:dikkat_arviis:997074866371039322> **Log kanalı ayarlanmamış.**', flags: 64 });
      }

      const logChannel = await interaction.guild.channels.fetch(logChannelId);
      const messages = await interaction.channel.messages.fetch({ limit: 100 });
      const sorted = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

      let html = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #2f3136; color: #dcddde; padding: 20px; }
          .message { display: flex; margin-bottom: 10px; }
          .avatar { width: 40px; height: 40px; border-radius: 50%; margin-right: 10px; }
          .content { }
          .author { font-weight: bold; color: #ffffff; }
          .timestamp { font-size: 0.8em; color: #72767d; margin-left: 5px; }
          .text { margin-top: 2px; }
        </style>
      </head>
      <body>
        <h2>Transcript: ${interaction.channel.name}</h2>
      `;

      for (const msg of sorted.values()) {
        const avatar = msg.author.displayAvatarURL({ extension: 'png' });
        const time = new Date(msg.createdTimestamp).toLocaleString();
        html += `
          <div class="message">
            <img src="${avatar}" class="avatar">
            <div class="content">
              <div>
                <span class="author">${msg.author.tag}</span>
                <span class="timestamp">${time}</span>
              </div>
              <div class="text">${msg.content || '[Embed/Attachment]'}</div>
            </div>
          </div>
        `;
      }

      html += `</body></html>`;

      const transcriptMessage = await logChannel.send({
        content: `## ${interaction.channel.name}`,
        files: [{ attachment: Buffer.from(html, 'utf-8'), name: `${interaction.channel.name}.html` }]
      });
        const transcriptMessageLink = `https://discord.com/channels/${interaction.guild.id}/${logChannel.id}/${transcriptMessage.id}`;
      const viewTranscriptButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Transcripte Git')
          .setStyle(ButtonStyle.Link)
          .setURL(transcriptMessageLink)
      );

      await logChannel.send({ content: '', components: [viewTranscriptButton] });

      const userEntry = Object.entries(db[guildId].activeTickets || {}).find(([_, chId]) => chId === interaction.channel.id);
      if (userEntry) {
        delete db[guildId].activeTickets[userEntry[0]];
        saveDB(db);
      }

      await interaction.reply('<a:yukleniyor_arviis:1058007845364322354> Destek talebi **kapatılıyor...**');
      setTimeout(() => interaction.channel.delete(), 5000);
    }

    else if (interaction.customId === 'kisi_ekle' || interaction.customId === 'kisi_cikar') {
      if (!interaction.member.roles.cache.has(supportRole)) {
        return interaction.reply({ content: '<a:dikkat_arviis:997074866371039322> **Bu işlemi yapmak için yetkin yok.**', flags: 64 });
      }

      await interaction.reply({ content: 'Kişinin ID\'sini kanala gönder.', flags: 64 });

      const filter = m => m.author.id === interaction.user.id;
      const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 15000 });

      if (collected.size === 0) {
        return interaction.followUp({ content: '⏰ **Süre doldu.**', flags: 64 });
      }

      const userId = collected.first().content;
      const member = await interaction.guild.members.fetch(userId).catch(() => null);

      if (!member) {
        return interaction.followUp({ content: '<a:dikkat_arviis:997074866371039322> **Geçerli bir kişi bulunamadı.**', flags: 64 });
      }

      if (interaction.customId === 'kisi_ekle') {
        await interaction.channel.permissionOverwrites.edit(member, {
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true
        });
        await interaction.followUp({ content: `<:tik_arviis:1046067679884234863> **${member.user.tag}** kanala **eklendi.**`, flags: 64 });
      }

      if (interaction.customId === 'kisi_cikar') {
        await interaction.channel.permissionOverwrites.edit(member, {
          ViewChannel: false
        });
        await interaction.followUp({ content: `<:tik_arviis:1046067679884234863> **${member.user.tag}** kanaldan **çıkarıldı.**`, flags: 64 });
      }
    }
  }
});