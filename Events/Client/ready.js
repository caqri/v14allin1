const { ActivityType } = require('discord.js');
const fs = require("fs");
const path = require("path");
const db2 = require('../../Utils/jsonDB');
const ayarlar = require('../../Settings/ayarlar.json');
const Eris = require('eris');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//BOT OYNUYOR
function getTotalMembers() {
  let count = 0;
  client.guilds.cache.forEach(guild => {
    count += guild.memberCount;
  });
  return count;
}

function getOnlineCount() {
  let count = 0;
  client.guilds.cache.forEach(guild => {
    guild.members.cache.forEach(member => {
      if (
        !member.user.bot &&
        member.presence &&
        ["online", "dnd", "idle"].includes(member.presence.status)
      ) {
        count++;
      }
    });
  });
  return count;
}

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
client.user.setPresence({
            activities: [{ name: `${getOnlineCount()} Çevrimiçi ・ ${getTotalMembers()} Üye`, type: ActivityType.Custom }],
        });

setInterval(() => {
  client.user.setPresence({
    activities: [{
      name: `${getOnlineCount()} Çevrimiçi ・ ${getTotalMembers()} Üye`,
      type: ActivityType.Custom
    }],
    status: "online"
  });
}, 5 * 60 * 1000); //5 Dakika - UNUTMArviS
        console.log(`🟢 [AKTİF] ${client.user.username}`);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//HATIRLATICI SİSTEMİ
const hatirlaticilariKontrolEt = require('../../Utils/hatirlaticiKontrol');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {

    await hatirlaticilariKontrolEt(client);

    setInterval(() => {
      hatirlaticilariKontrolEt(client);
    }, 60 * 1000);
  }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//SÜRELİ MESAJ SİSTEMİ
const filePath = path.join(__dirname, "../../Database/süreliMesaj.json");

function readData() {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

client.guilds.cache.forEach(guild => {
  const data = readData(); 
  const veri = data[guild.id];
  if (!veri) return;

  const kanal = guild.channels.cache.get(veri.kanalID);
  if (!kanal) return;

  setInterval(() => {
    kanal.send(veri.mesaj).catch(console.error);
  }, veri.süre);
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//GÜNLÜK-HAFTALIK VERİ SIFIRLAMA
const lastReset = {
  daily: null,
  weekly: null
};

setInterval(async () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const today = now.toDateString();
  const kanalID = db2.get("reset_log_channel");

  if (hours === 0 && minutes === 0 && lastReset.daily !== today) {

    const all = db2.all();
    for (const entry of all) {
      if (entry.ID.startsWith("msg_1d_") || entry.ID.startsWith("voice_1d_")) {
        db2.delete(entry.ID);
      }
    }

    if (kanalID) {
      try {
        const kanal = await client.channels.fetch(kanalID);
        await kanal.send("🌇 Günlük veriler **sıfırlandı.**");
      } catch (err) {
        console.error("Günlük sıfırlama log kanalı bulunamadı:", err);
      }
    }

    lastReset.daily = today;
  }

  if (hours === 0 && minutes === 0 && now.getDay() === 0 && lastReset.weekly !== today) {

    const all = db2.all();
    for (const entry of all) {
      if (entry.ID.startsWith("msg_7d_") || entry.ID.startsWith("voice_7d_")) {
        db2.delete(entry.ID);
      }
    }

    if (kanalID) {
      try {
        const kanal = await client.channels.fetch(kanalID);
        await kanal.send("📅 Haftalık veriler **sıfırlandı.**");
      } catch (err) {
        console.error("Haftalık sıfırlama log kanalı bulunamadı:", err);
      }
    }

    lastReset.weekly = today;
  }

}, {
    timezone: "Europe/Istanbul"
  }, 60 * 1000);
    },
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//ERİS SES
const dosyaYolu = path.join(__dirname, "../../Database/sesKanali.json");

function veriOku() {
  if (!fs.existsSync(dosyaYolu)) return {};
  try {
    return JSON.parse(fs.readFileSync(dosyaYolu, "utf8"));
  } catch {
    return {};
  }
}

const _client = new Eris(ayarlar.token, {
  intents: ["all"]
});
_client.connect();

_client.on("ready", async () => {
  const veri = veriOku();
  const aktifKanal = veri.aktifSesKanali;
  
  if (!aktifKanal) {
    console.log("⚠️ [SES - HATA] Ses kanalı seçilmemiş.");
    return;
  }

  try {
    await _client.joinVoiceChannel(aktifKanal, { selfMute: false, selfDeaf: true });
    console.log(`🟢 [SES - BAŞARILI] Bot Ses kanalına katıldı.`);
  } catch (err) {
    console.error(`⚠️ [SES - HATA] Bot ${aktifKanal} kanalına katılamadı:`, err);
  }
});

_client.on('disconnect', (error) => {
  if (error?.code === 4022) {
    setTimeout(() => joinVoice(guildId, channelId), 2500);
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//YOUTUBE ALERT
setInterval(async() =>{
  require("../../Commands/Bildirim/ytalertconf")(client);
  },20000);
  
  Promise.prototype.sil = function (time) {
      if (this) this.then(s => {
        if (s.deletable) {
          setTimeout(async () => {
            s.delete().catch(e => { });
          }, time * 1000)
        }
      });
    };
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////