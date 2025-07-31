const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const veriYolu = path.join(__dirname, '../../Database/hatirlatici.json');

function veriOku() {
  if (!fs.existsSync(veriYolu)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(veriYolu, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function veriYaz(data) {
  fs.writeFileSync(veriYolu, JSON.stringify(data, null, 2));
}

function turkceSureyiMsyeCevir(sureStr) {
  sureStr = sureStr.toLowerCase();
  const regex = /(\d+)\s*(saniye|dakika|saat|gün|hafta|ay|yıl)/;
  const match = sureStr.match(regex);
  if (!match) return null;

  const miktar = parseInt(match[1]);
  const birim = match[2];

  switch (birim) {
    case 'saniye': return miktar * 1000;
    case 'dakika': return miktar * 60 * 1000;
    case 'saat':   return miktar * 60 * 60 * 1000;
    case 'gün':    return miktar * 24 * 60 * 60 * 1000;
    case 'hafta':  return miktar * 7 * 24 * 60 * 60 * 1000;
    case 'ay':     return miktar * 30 * 24 * 60 * 60 * 1000;
    case 'yıl':    return miktar * 365 * 24 * 60 * 60 * 1000;
    default: return null;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hatırlatıcı')
    .setDescription('Girilen süre sonunda hatırlatma gönderir.')
    .addStringOption(option =>
      option.setName('süre')
        .setDescription("Süre gir. ('5 saniye', '10 dakika', '1 saat', '2 hafta', '3 ay', '4 yıl')")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('metin')
        .setDescription('Metin gir.')
        .setRequired(true)
    ),

  async execute(interaction) {
    const sureStr = interaction.options.getString('süre');
    const metin = interaction.options.getString('metin');
    const ms = turkceSureyiMsyeCevir(sureStr);
    const hedefZaman = Math.floor((Date.now() + ms) / 1000);

    if (!ms || ms < 1000) {
      return interaction.reply({
        content: '<:carpi_arviis:1046067681515814912> **Geçerli bir süre gir.**',
        flasg: 64
      });
    }

    const zamanDamgasi = Date.now() + ms;
    const hatirlatmaId = `${interaction.user.id}-${Date.now()}`;
    const veri = veriOku();

    veri.push({
  id: hatirlatmaId,
  userId: interaction.user.id,
  guildId: interaction.guildId,
  channelId: interaction.channel.id,
  messageId: interaction.id,
  text: metin,
  zaman: hedefZaman 
});

    veriYaz(veri);

    await interaction.reply(`Tamamdır <@${interaction.user.id}>, **<t:${hedefZaman}:F>** ( **<t:${hedefZaman}:R>** ) **:** \`${metin}\``);

    if (ms <= 2147483647) {
      setTimeout(async () => {
  const kanal = await interaction.client.channels.fetch(interaction.channel.id).catch(() => null);
  if (!kanal) return;

  const yanitMesaji = await interaction.fetchReply();

  const butonlar = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Orijinal Mesaja Git')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${yanitMesaji.id}`),
    new ButtonBuilder()
      .setCustomId(`okundu_${interaction.user.id}_${yanitMesaji.id}`)
      .setLabel('Tamamdır')
      .setStyle(ButtonStyle.Primary)
      .setEmoji("👁️")
  );

  await kanal.send({
    content: `<a:bildirim_arviis:997610170119098468> <@${interaction.user.id}> | **<t:${hedefZaman}:R>** **:** \`${metin}\``,
    components: [butonlar]
  }).catch(() => null);

  const yeniVeri = veriOku().filter(v => v.id !== hatirlatmaId);
  veriYaz(yeniVeri);
}, ms);

    }
  }
};