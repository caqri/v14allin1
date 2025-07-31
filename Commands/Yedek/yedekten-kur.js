const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const YEDEK_KLASORU = path.join(__dirname, "./Yedekler");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("yedekten-kur")
    .setDescription("Yedek ID'sine göre sunucuyu sıfırdan kurar.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName("yedek-id")
        .setDescription("ID gir. (yedek_123456789_171512341)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const yedekId = interaction.options.getString("yedek-id");
    const dosyaYolu = path.join(YEDEK_KLASORU, `${yedekId}.yaml`);
    const guild = interaction.guild;

    if (!fs.existsSync(dosyaYolu)) {
      return interaction.reply({
        content: "<a:dikkat_arviis:997074866371039322> **Bu ID ile kayıtlı bir yedek bulunamadı.**",
        flags: 64,
      });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("yedek_onayla")
        .setLabel("Evet")
        .setEmoji("<:tik_arviis:1046067679884234863>")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("yedek_iptal")
        .setLabel("Vazgeç")
        .setEmoji("<:carpi_arviis:1046067681515814912>")
        .setStyle(ButtonStyle.Danger)
    );

    const onayMesaji = await interaction.reply({
      content:
        "<:info_arviis:997609746410504282> **UYARI:** __Bu işlem sunucudaki tüm kanalları ve rolleri siler.__ \n\n" +
        "▶️ Devam etmek istiyor musun?",
      components: [row],
    });

    const collector = onayMesaji.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30_000,
    });

    collector.on("collect", async (button) => {
      if (button.user.id !== interaction.user.id) {
        return button.reply({
          content: "<a:dikkat_arviis:997074866371039322> **Bu buton sana ait değil.**",
          flags: 64,
        });
      }

      if (button.customId === "yedek_iptal") {
        collector.stop("iptal");
        return button.update({
          content: "<:carpi_arviis:1046067681515814912> İşlem iptal **edildi.**",
          components: [],
        });
      }

      if (button.customId === "yedek_onayla") {
        collector.stop("onay");

        await button.update({
          content: "<a:yukleniyor_arviis:1058007845364322354> Yedek kurulumu başlatılıyor...",
          components: [],
        });

        const yedekVerisi = yaml.load(fs.readFileSync(dosyaYolu, "utf8"));

const silinecekRoller = guild.roles.cache.filter(
  r => r.id !== guild.id 
);

for (const role of silinecekRoller.values()) {
  try {
    await role.delete("Yedek kurulumu için eski rol silindi");
  } catch (e) {
    console.warn(`Rol silinemedi: ${role.name} - ${e.message}`);
  }
}

        for (const channel of guild.channels.cache.values()) {
          try {
            await channel.delete("Yedek kurulumu için eski kanal silindi");
          } catch (e) {
            console.warn(`Kanal silinemedi: ${channel.name} - ${e.message}`);
          }
        }

        const roller = [...(yedekVerisi.roller || [])].sort((a, b) => b.position - a.position);
        for (const rol of roller) {
          try {
            await guild.roles.create({
              name: rol.name,
              color: rol.color,
              permissions: BigInt(rol.permissions || 0n),
              mentionable: rol.mentionable,
              hoist: rol.hoist,
              reason: "Yedekten rol kurulumu",
            });
          } catch (e) {
            console.warn(`Rol oluşturulamadı: ${rol.name} - ${e.message}`);
          }
        }

        const kategoriMap = new Map();
        const kategoriler = (yedekVerisi.kanallar || []).filter(k => k.type === ChannelType.GuildCategory);

        for (const kategori of kategoriler) {
          try {
            const yeniKategori = await guild.channels.create({
              name: kategori.name,
              type: ChannelType.GuildCategory,
              position: kategori.position,
              reason: "Yedekten kategori kurulumu",
            });
            kategoriMap.set(kategori.id, yeniKategori.id);
          } catch (e) {
            console.warn(`Kategori oluşturulamadı: ${kategori.name} - ${e.message}`);
          }
        }

        const digerKanallar = (yedekVerisi.kanallar || []).filter(k => k.type !== ChannelType.GuildCategory);

        for (const kanal of digerKanallar) {
          try {
            await guild.channels.create({
              name: kanal.name,
              type: kanal.type,
              position: kanal.position,
              parent: kategoriMap.get(kanal.parent) || undefined,
              reason: "Yedekten kanal kurulumu",
            });
          } catch (e) {
            console.warn(`Kanal oluşturulamadı: ${kanal.name} - ${e.message}`);
          }
        }

        try {
  await interaction.editReply({
    content: `<:tik_arviis:1046067679884234863> **${guild.name}** sunucusu sıfırlandı ve yedek **kuruldu.**`,
  }); 
} catch (err) {
  if (err.code === 10003, 10008) {
    console.warn(`[YEDEK - UYARI] Komut kanalı silinmiş, yanıt gönderilemedi. ( ${guild.name} )`);
  } else {
    console.error(`[YEDEK - HATA] Yedek kurulum yanıtı gönderilemedi:`, err);
  }
}
      }
    });

    collector.on("end", (_collected, reason) => {
      if (reason !== "onay" && reason !== "iptal") {
        interaction.editReply({
          content: "⏰ İşlem zamanaşımına uğradı.",
          components: [],
        });
      }
    });
  },
};