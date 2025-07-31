const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const dns = require('dns').promises;
const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const limitDosyasi = path.join(__dirname, '../../Database/ipSorgulaSinir.json');
const GUNLUK_LIMIT = 3;

function loadLimitData() {
  if (!fs.existsSync(limitDosyasi)) {
    fs.writeFileSync(limitDosyasi, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(limitDosyasi));
}

function saveLimitData(data) {
  fs.writeFileSync(limitDosyasi, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ip-sorgula')
    .setDescription('IP adresi hakkında detaylı bilgi verir.')
    .addStringOption(option =>
      option.setName('ip-adresi')
        .setDescription('IP adresi gir.')
        .setRequired(true)
    ),

  async execute(interaction) {
    const ip = interaction.options.getString('ip-adresi');
    const userId = interaction.user.id;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    let limitData = loadLimitData();
    if (!limitData[userId] || limitData[userId].date !== todayStr) {
      limitData[userId] = { date: todayStr, count: 0 };
    }

    if (limitData[userId].count >= GUNLUK_LIMIT) {
  return interaction.reply({
    content: `<a:dikkat_arviis:997074866371039322> **Günlük IP sorgulama sınırına ulaştın.** \n <:sadesagok_arviis:1109797490665996349> __Her gün saat 00:00'da sıfırlanır.__`,
    flags: 64
  });
}

await interaction.deferReply();

limitData[userId].count += 1;
saveLimitData(limitData);

const kalanSorgu = GUNLUK_LIMIT - limitData[userId].count;

const res = await fetch(`https://ipwho.is/${ip}`);
const data = await res.json();

if (!data.success) {
  return interaction.editReply({
    content: `<a:dikkat_arviis:997074866371039322> **IP sorgusunda hata**: ${data.message || '**Geçersiz IP veya servis hatası.**'}`
  });
}


    let hostname = '<:carpi_arviis:1046067681515814912> **Yok.**';
    try {
      const [ptr] = await dns.reverse(ip);
      hostname = ptr;
    } catch (err) {}

    const flagUrl = data.country_code
      ? `https://flagcdn.com/w320/${data.country_code.toLowerCase()}.png`
      : null;

    const staticMap = `https://staticmap.openstreetmap.de/staticmap.php?center=${data.latitude},${data.longitude}&zoom=10&size=600x300&markers=${data.latitude},${data.longitude},red-pushpin`;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`;
    const jsonViewUrl = `https://ipwhois.app/json/${ip}`;

    const abuseRes = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}`, {
      headers: {
        'Key': 'ae9b19ef4115843169f80476c968343ca29613274429eb33cfe09903bd00d6ade6b814ff63978f02',
        'Accept': 'application/json'
      }
    });
    const abuseData = await abuseRes.json();

    const ipinfoRes = await fetch(`https://ipinfo.io/${ip}?token=aa69da7a290df8`);
    const ipinfoData = await ipinfoRes.json();

    let countryInfo = null;
    try {
      const countryRes = await fetch(`https://restcountries.com/v3.1/alpha/${data.country_code}`);
      const countryData = await countryRes.json();
      if (Array.isArray(countryData) && countryData.length > 0) {
        countryInfo = countryData[0];
      }
    } catch {}

    let weatherInfo = '<:carpi_arviis:1046067681515814912> **Bilinmiyor.**';
    try {
      const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${data.latitude}&lon=${data.longitude}&appid=6b75387b8d6d45e4d9f338abb4cb53bb&units=metric&lang=tr`);
      const weatherData = await weatherRes.json();
      if (weatherData.weather && weatherData.weather.length > 0 && weatherData.main) {
        weatherInfo = `${weatherData.weather[0].description}, ${weatherData.main.temp}°C`;
      }
    } catch {}

    const embed = new EmbedBuilder()
      .setColor(data.connection?.proxy ? 0xFF0000 : 0x00C896)
      .setDescription("# <:uyari_arviis:1372336588268376154> YASAL UYARI \n- __**Bu komut eğlence amaçlı yapılmıştır.**__ Kullanımı tamamen sana ait. Başına gelen/gelebilecek şeylerden __**ben sorumlu değilim, sorumluluk kabul etmiyorum**__ bilgin olsun. \n  - Sonradan 'Abi ben bilmiyordum, abi şöyle, abi böyle' deme, __**KOCAMAN**__ yazılarla bilgilendiriyorum. __**Okumaman senin sorunun.**__ \n ឵ ")
      .setThumbnail(staticMap)
      .setImage(flagUrl)
      .addFields(
        { name: 'IP Türü', value: String(data.type || '<:carpi_arviis:1046067681515814912> **Bilinmiyor.**'), inline: true },
        { name: 'Kıta', value: String(data.continent || '<:carpi_arviis:1046067681515814912> **Bilinmiyor.**'), inline: true },
        { name: 'Ülke', value: String(data.country || '<:carpi_arviis:1046067681515814912> **Bilinmiyor.**'), inline: true },
        { name: 'Bölge', value: String(data.region || '<:carpi_arviis:1046067681515814912> **Bilinmiyor.**'), inline: true },
        { name: 'Şehir', value: String(data.city || '<:carpi_arviis:1046067681515814912> **Bilinmiyor.**'), inline: true },
        { name: 'Posta Kodu', value: String(data.postal || '<:carpi_arviis:1046067681515814912> **Yok.**'), inline: true },
        { name: 'Koordinatlar', value: `${data.latitude}, ${data.longitude}`, inline: true },
        { name: 'Başkent', value: String(data.capital || '<:carpi_arviis:1046067681515814912> **Bilinmiyor.**'), inline: true },
        { name: 'Telefon Kodu', value: `+${data.calling_code || '<:carpi_arviis:1046067681515814912> **Yok.**'}`, inline: true },
        { name: 'AB Üyesi mi?', value: data.is_eu ? '<:tik_arviis:1046067679884234863> **Evet.**' : '<:carpi_arviis:1046067681515814912> **Hayır.**', inline: true },
        { name: 'Zaman Dilimi', value: `${data.timezone?.id || '<:carpi_arviis:1046067681515814912> **Yok.**'} \n**(** ${data.timezone?.utc || '<:carpi_arviis:1046067681515814912> **UTC bilgisi yok.**'} **)**`, inline: true },
        { name: 'İSS', value: String(data.connection?.isp || '<:carpi_arviis:1046067681515814912> **Bilinmiyor.**'), inline: true },
        { name: 'VPN / Proxy?', value: data.connection?.proxy ? '<:tik_arviis:1046067679884234863> **Evet.**' : '<:carpi_arviis:1046067681515814912> **Hayır.**', inline: true },
        { name: 'Hostname (PTR)', value: String(hostname || '<:carpi_arviis:1046067681515814912> **Yok.**'), inline: true },
        { name: 'Mobil Bağlantı mı?', value: data.connection?.mobile ? '<:tik_arviis:1046067679884234863> **Evet.**' : '<:carpi_arviis:1046067681515814912> **Hayır.**', inline: true },
        { name: 'Hosting mi?', value: data.connection?.hosting ? '<:tik_arviis:1046067679884234863> **Evet.**' : '<:carpi_arviis:1046067681515814912> **Hayır.**', inline: true },
        { name: 'Tor Ağı?', value: data.security?.tor ? '<:tik_arviis:1046067679884234863> **Tor Exit Node.**' : '<:carpi_arviis:1046067681515814912> **Hayır.**', inline: true },
        { name: 'Kullanıcı Türü', value: String(data.connection?.org || '<:carpi_arviis:1046067681515814912> **Bilinmiyor.**'), inline: true },
        { name: 'DB Skoru', value: `${abuseData.data.abuseConfidenceScore || '<:carpi_arviis:1046067681515814912> **Bilinmiyor.**'} / 100`, inline: true },
        { name: 'Organizasyon', value: ipinfoData.org || '<:carpi_arviis:1046067681515814912> **Bilinmiyor.**', inline: true },
        { name: 'Lokasyon', value: ipinfoData.loc || '<:carpi_arviis:1046067681515814912> **Bilinmiyor.**', inline: true },
        { name: 'Hava Durumu', value: weatherInfo, inline: true },
        { name: 'Ülke Nüfusu', value: countryInfo?.population?.toLocaleString('tr-TR') || '<:carpi_arviis:1046067681515814912> **Yok.**', inline: true },
        { name: 'Ülke Dili', value: countryInfo?.languages ? Object.values(countryInfo.languages).join(', ') : '<:carpi_arviis:1046067681515814912> **Yok.**', inline: true },
        { name: 'Para Birimi', value: countryInfo?.currencies ? Object.values(countryInfo.currencies).map(c => c.name).join(', ') : '<:carpi_arviis:1046067681515814912> **Yok.**', inline: true }
      );

    const kalanSorguButonu = new ButtonBuilder()
  .setCustomId('kalan_sorgu')
  .setLabel(`${kalanSorgu} / ${GUNLUK_LIMIT}`)
  .setStyle(ButtonStyle.Secondary)
  .setDisabled(true);

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Google Maps\'te Gör')
          .setStyle(ButtonStyle.Link)
          .setURL(googleMapsUrl),

          kalanSorguButonu,

        new ButtonBuilder()
          .setLabel('JSON Detayları')
          .setStyle(ButtonStyle.Link)
          .setURL(jsonViewUrl)
      );

    await interaction.editReply({ embeds: [embed], components: [row] });
}
};
