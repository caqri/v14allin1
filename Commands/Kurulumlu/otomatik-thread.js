const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../../Database/otoThread.json");

function readData() {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("otomatik-thread")
    .setDescription("Otomatik thread sistemini ayarlar.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub
        .setName("ayarla")
        .setDescription("Belirli bir kanala mesaj geldiğinde otomatik thread oluştur.")
        .addChannelOption(option =>
          option.setName("kanal")
            .setDescription("Kanal seç.")
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName("isim")
            .setDescription("Thread adı.")
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option.setName("süre")
            .setDescription("Thread arşivlenme süresi.")
            .addChoices(
              { name: "1 Saat", value: 60 },
              { name: "1 Gün", value: 1440 },
              { name: "3 Gün", value: 4320 },
              { name: "1 Hafta", value: 10080 },
            )
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName("botlar")
            .setDescription("Botlar dahil edilsin mi?")
            .addChoices(
              { name: "Evet", value: "evet" },
              { name: "Hayır", value: "hayır" }
            )
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName("sebep")
            .setDescription("Thread oluşturma sebebi.")
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("sıfırla")
        .setDescription("Otomatik thread sistemini sıfırla.")
        .addChannelOption(option =>
          option.setName("kanal")
            .setDescription("Kanal seç.")
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const data = readData();

    if (subcommand === "ayarla") {
  const kanal = interaction.options.getChannel("kanal");
  const isim = interaction.options.getString("isim");
  const süre = interaction.options.getInteger("süre");
  const sebep = interaction.options.getString("sebep") || "Belirtilmedi";
  const botlar = interaction.options.getString("botlar") === "evet";

  const guildId = interaction.guild.id;

  if (!data[guildId]) {
    data[guildId] = {};
  }

  data[guildId][kanal.id] = { isim, süre, sebep, botlar };
  writeData(data);

  return interaction.reply({
    content: `<:tik_arviis:1046067679884234863> **<#${kanal.id}>** kanalına mesaj gelince otomatik thread açılacak. \n\n<:hashtag_arviis:1051904217478070276> İsim: \`${isim}\` \n<a:saat_arviis:1367655591560085535> Süre: \`${süre} dk\`\n📄 Sebep: \`${sebep}\`\n-# <:sadesagok_arviis:1109797490665996349> Bot mesajları: **${botlar ? "__Dahil__" : "__Hariç__"}**`,
    flags: 64
  });
}

if (subcommand === "sıfırla") {
  const kanal = interaction.options.getChannel("kanal");
  const guildId = interaction.guild.id;

  if (!data[guildId] || !data[guildId][kanal.id]) {
    return interaction.reply({
      content: "<a:dikkat_arviis:997074866371039322> **Bu kanalda ayarlanmış bir otomatik thread sistemi yok.**",
      flags: 64
    });
  }

  delete data[guildId][kanal.id];
  if (Object.keys(data[guildId]).length === 0) {
    delete data[guildId]; 
  }

  writeData(data);

  return interaction.reply({
    content: "<:tik_arviis:1046067679884234863> Otomatik thread oluşturma sistemi **sıfırlandı.**",
    flags: 64
  });
}
  }
};