const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../../Database/girisCikis.json");

function loadDB() {
  if (!fs.existsSync(dbPath)) return {};
  return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
}

function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giriş-çıkış")
    .setDescription("Giriş-çıkış sistemini ayarlar.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    
    .addChannelOption(option =>
      option.setName("giriş-kanal")
        .setDescription("Kanal seç.")
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName("çıkış-kanal")
        .setDescription("Kanal seç.")
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("resimli-mi")
        .setDescription("Giriş mesajı resimli mi olsun?")
        .addChoices(
          { name: "Evet", value: "evet" },
          { name: "Hayır", value: "hayir" }
        )
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName("görsel-dosya-adı")
        .setDescription("Giriş mesajı için kullanılacak arka plan görselinin adı (assets klasöründen)")
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName("giriş-mesajı")
        .setDescription("Özel giriş mesajı (Hoş geldin {user})")
        .setRequired(false)
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;

    const girisKanal = interaction.options.getChannel("giriş-kanal");
    const cikisKanal = interaction.options.getChannel("çıkış-kanal");
    const resimli = interaction.options.getString("resimli-mi");
    const gorselAdi = interaction.options.getString("görsel-dosya-adı");
    const girisMesaj = interaction.options.getString("giriş-mesajı") || "Sunucuya **hoş geldin!**";

    let data = loadDB();

    if (resimli === "evet" && !gorselAdi) {
      return interaction.reply({
        content: "<a:dikkat_arviis:997074866371039322> **Resimli giriş mesajı istendi ancak görsel dosya adı belirtilmedi.**",
        flags: 64
      });
    }

    if (!data[guildId]) data[guildId] = {};

    data[guildId].giris = {
      kanal: girisKanal.id,
      resimli: resimli || "hayir",
      gorsel: gorselAdi || null,
      mesaj: girisMesaj
    };

    data[guildId].cikis = {
      kanal: cikisKanal.id
    };

    saveDB(data);

    const girisBilgi = `Giriş ayarlandı → <#${girisKanal.id}>\nResimli: ${resimli === "evet" ? "Evet" : "Hayır"}\nGörsel: \`${gorselAdi || "Yok"}\`\nMesaj: \`${girisMesaj}\``;
    const cikisBilgi = `Çıkış ayarlandı → <#${cikisKanal.id}>`;

    await interaction.reply({
      content: `<:tik_arviis:1046067679884234863> Sistem ayarlandı. \n\n${girisBilgi} \n\n${cikisBilgi}`,
      flags: 64
    });
  }
};