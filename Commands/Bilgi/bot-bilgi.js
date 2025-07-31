const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const cpuStat = require("cpu-stat");
const os = require("os");
const { version: discordjsVersion } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bot-bilgi")
    .setDescription("Bot hakkında detaylı bilgi verir."),

  async execute(interaction, client) {
    const guild = interaction.guild;
    const yapimciID = "216222397349625857";
    const yapimci = await client.users.fetch(yapimciID, { force: true });

    cpuStat.usagePercent(async (error, percent) => {
      if (error) return interaction.reply({ content: `Hata: ${error}` });

      const bellekKullanimi = formatBytes(process.memoryUsage().heapUsed);
      const uptime = formatUptime(client.uptime);
      const toplamKullanici = client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0);

      const osType = os.type(); 
      const osPlatform = os.platform(); 
      const osArch = os.arch(); 
      const osUptime = formatUptime(os.uptime() * 1000);
      const cpuModel = os.cpus()[0].model;
      const cpuCores = os.cpus().length;
    const joinedAt = guild.members.cache.get(interaction.client.user.id)?.joinedAt;

      const embed = new EmbedBuilder()
        .setAuthor({ name: `${client.user.username} | Bot Bilgileri`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
        .setColor(0x664dd6)
        .setThumbnail(yapimci.displayAvatarURL({ dynamic: true }))
        .setImage(yapimci.bannerURL({ dynamic: true, size: 1024 }) || null)
        .addFields(
          { name: "<a:donen_dev_arviis:1373995006485856326> Yapımcı", value: `> <@${yapimciID}> **(** ${yapimci.username} **)**`, inline: true },
          { name: "Oluşturulma Tarihi", value: `> <t:${Math.floor(client.user.createdTimestamp / 1000)}:D>`, inline: true },
          { name: "<:bulut_arviis:1051904222150529094> Botun Katıldığı Tarih", value: `> <t:${parseInt(joinedAt / 1000)}:D>`, inline: false },
          {
            name: "Bot Durumu",
            value:
`\`\`\`
📡 Sunucular:        ${client.guilds.cache.size}

👥 Kullanıcılar:     ${toplamKullanici}

🧠 RAM:              ${bellekKullanimi}

⚙️ CPU Kullanımı:    %${percent.toFixed(2)}

⏱️ Uptime:           ${uptime}

📦 Discord.JS:       v${discordjsVersion}

🧪 Node.JS:          ${process.version}
\`\`\``
          },
          {
            name: "Host Bilgileri",
            value:
`\`\`\`
🖥️ Sistem:           ${osType}

🏗️ Mimari:           ${osPlatform} | ${osArch}

🧠 CPU Modeli:       ${cpuModel}

🧩 Çekirdek:         ${cpuCores} Çekirdek

⏰ Uptime:           ${osUptime}
\`\`\``
          }
        );

      await interaction.reply({ embeds: [embed] });
    });

    function formatBytes(bytes, decimals = 2) {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ["B", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    }

    function formatUptime(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${days}:${hours}:${minutes}:${seconds}`;
    }
  }
};
