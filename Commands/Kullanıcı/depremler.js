const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('depremler')
    .setDescription('Türkiye’deki güncel deprem istatistiklerini gösterir.'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const response = await fetch('https://api.orhanaydogdu.com.tr/deprem/kandilli/live');
      const data = await response.json();

      const earthquakes = data.result;

      if (!earthquakes || !Array.isArray(earthquakes) || earthquakes.length === 0) {
        return interaction.editReply('<a:dikkat_arviis:997074866371039322> **Deprem verileri şu anda alınamıyor. Daha sonra tekrar dene.**');
      }

      const lastFive = earthquakes.slice(0, 5)
  .map(eq => {
    const timestamp = Math.floor(new Date(eq.date).getTime() / 1000);
    return `<t:${timestamp}:t> [**${eq.title}**](https://alkan.web.tr) <:earthquake_arviis:1375836828837347428> ${eq.mag}`;
  })
  .join('\n');

      const cityCounts = {};
      earthquakes.forEach(eq => {
        const city = eq.title.split('-')[0].trim() || '<:carpi_arviis:1046067681515814912> Bilinmiyor.';
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      });
      const topCities = Object.entries(cityCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([city, count]) => `- ${city} (**${count}**)`)
        .join('\n');

      const regionMap = {
        ':evergreen_tree:  Akdeniz': ['Antalya', 'Adana', 'Mersin', 'Hatay', 'Osmaniye', 'Kahramanmaraş'],
        '☀️ Ege': ['İzmir', 'Aydın', 'Muğla', 'Manisa', 'Denizli'],
        '🌊 Karadeniz': ['Samsun', 'Trabzon', 'Ordu', 'Giresun', 'Rize'],
        '🏢 Marmara': ['İstanbul', 'Bursa', 'Kocaeli', 'Sakarya', 'Tekirdağ'],
        '🏔️ Doğu Anadolu': ['Elazığ', 'Malatya', 'Erzurum', 'Van', 'Bingöl'],
        '🥜 İç Anadolu': ['Ankara', 'Konya', 'Kayseri', 'Eskişehir', 'Sivas'],
        '💡 Güneydoğu Anadolu': ['Diyarbakır', 'Şanlıurfa', 'Gaziantep', 'Mardin', 'Batman']
      };

      const regionCounts = {};
      for (const eq of earthquakes) {
  let matched = false;

  for (const region of Object.keys(regionMap)) {
    if (eq.title.toLowerCase().includes(region.toLowerCase())) {
      regionCounts[region] = (regionCounts[region] || 0) + 1;
      matched = true;
      break;
    }
  }

  if (!matched) {
    for (const [region, cities] of Object.entries(regionMap)) {
      if (cities.some(c => eq.title.toLowerCase().includes(c.toLowerCase()))) {
        regionCounts[region] = (regionCounts[region] || 0) + 1;
        matched = true;
        break;
      }
    }
  }

  if (!matched) {
    regionCounts['<:carpi_arviis:1046067681515814912> Bilinmiyor.'] = (regionCounts['<:carpi_arviis:1046067681515814912> Bilinmiyor.'] || 0) + 1;
  }
}

      const topRegions = Object.entries(regionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([region, count]) => `- ${region} (**${count}**)`)
        .join('\n');

      const now = new Date();
      const periods = [
  { label: 'Tüm Gelen Veri', ms: Infinity },
  { label: 'Son 7 Gün', ms: 7 * 24 * 60 * 60 * 1000 },
  { label: 'Son 24 Saat', ms: 24 * 60 * 60 * 1000 }
];

      const stats = periods.map(p => {
  const count = earthquakes.filter(eq => {
    const eqTime = new Date(eq.date);
    return (now - eqTime) <= p.ms;
  }).length;
  return `- ${p.label}: (**${count})**`;
}).join('\n');

      const description = `
## <a:turkbayragi_arviis:1375854552422809700> Türkiye'de ki Son 5 Deprem
${lastFive || '<:carpi_arviis:1046067681515814912> Veri **yok.**'}
## <:sinir_arviis:1375844442933694605> En Çok Deprem Olan Şehirler
${topCities || '<:carpi_arviis:1046067681515814912> Veri **yok.**'}
## <a:chart_increasing_avriis:1375844605496528926> En Çok Deprem Olan Bölgeler
${topRegions || '<:carpi_arviis:1046067681515814912> Veri **yok.**'}
## <:istatistik_arviis:1375848409637978232> Deprem İstatistikleri
${stats || '<:carpi_arviis:1046067681515814912> Veri **yok.**'}
      `;

      const embed = new EmbedBuilder()
        .setColor(0xba3434)
        .setDescription(description.trim())
        .setThumbnail("https://media.discordapp.net/attachments/1069639498637525043/1375838158603943948/2270-flagmap-tr.png?ex=683324a2&is=6831d322&hm=10d59bc2b835262265a139d20579b8e2c2bddf115982d59d0cc8acf5b0d3caf5&=&format=webp&quality=lossless&width=168&height=72");

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.editReply('<a:dikkat_arviis:997074866371039322> **Deprem verileri alınırken hata oluştu.**');
    }
  },
};
