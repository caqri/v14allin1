const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../../Database/reklamEngel.json");

function readData() {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reklam-engel")
    .setDescription("Reklam engel sistemini yönet.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub
        .setName("ayarla")
        .setDescription("Reklam engel sistemini ayarlar.")
        .addChannelOption(option =>
          option.setName("log-kanal")
            .setDescription("Log mesajı atılacak kanal.")
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setRequired(true)
        )
        .addRoleOption(option =>
          option.setName("muaf-rol")
            .setDescription("Muaf rol.")
            .setRequired(true)
        )
        .addChannelOption(option =>
          option.setName("muaf-kanal")
            .setDescription("Muaf kanal.")
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("durum")
        .setDescription("Sistemi aç veya kapat.")
        .addStringOption(option =>
          option.setName("seçim")
            .setDescription("Durum seçin.")
            .setRequired(true)
            .addChoices(
              { name: "Aç", value: "ac" },
              { name: "Kapat", value: "kapat" }
            )
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("sıfırla")
        .setDescription("Reklam engel sistemini sıfırlar.")
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const data = readData();
    const eskiVeri = data[guildId] || {};
    let muafKanalListesi = eskiVeri.muafKanallar || [];

    if (sub === "ayarla") {
      const logKanal = interaction.options.getChannel("log-kanal");
      const muafRol = interaction.options.getRole("muaf-rol");
      const muafKanal = interaction.options.getChannel("muaf-kanal");

      if (muafKanal && !muafKanalListesi.includes(muafKanal.id)) {
        muafKanalListesi.push(muafKanal.id);
      }

      data[guildId] = {
        ...eskiVeri,
        logKanal: logKanal.id,
        muafRol: muafRol.id,
        muafKanallar: muafKanalListesi,
      };
      writeData(data);

      return interaction.reply({
        content:
          `<:tik_arviis:1046067679884234863> Reklam engel **ayarlandı**. \n` +
          `\n<:ampul_arviis:1052278328280764536> Muaf rol: <@&${muafRol.id}>` +
          (muafKanal ? `\n<:hashtag_arviis:1051904217478070276> Muaf kanal: <#${muafKanal.id}>` : "") +
          `\n<:hashtag_arviis:1051904217478070276> Log kanalı: <#${logKanal.id}>`,
        flags: 64
      });
    }

    if (sub === "durum") {
      const seçim = interaction.options.getString("seçim");
      const durum = seçim === "ac";

      data[guildId] = {
        ...eskiVeri,
        aktif: durum
      };
      writeData(data);

      return interaction.reply({
        content: `<:tik_arviis:1046067679884234863> Reklam engel sistemi **${durum ? "Aktif edildi" : "Devre dışı bırakıldı"}**.`,
        flags: 64
      });
    }

    if (sub === "sıfırla") {
      if (data[guildId]) {
        delete data[guildId];
        writeData(data);
        return interaction.reply({
          content: "<:tik_arviis:1046067679884234863> Reklam engel sistemi başarıyla **sıfırlandı**.",
          flags: 64
        });
      } else {
        return interaction.reply({
          content: "<a:dikkat_arviis:997074866371039322> **Reklam engel ayarı bulunamadı.**",
          flags: 64
        });
      }
    }
  }
};
