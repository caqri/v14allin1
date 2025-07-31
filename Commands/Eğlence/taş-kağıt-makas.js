const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const veriYolu = path.join(__dirname, '../../Database/tasKagitMakas.json');

function oku() {
  if (!fs.existsSync(veriYolu)) return {};
  try {
    return JSON.parse(fs.readFileSync(veriYolu, 'utf8'));
  } catch {
    return {};
  }
}

function yaz(data) {
  fs.writeFileSync(veriYolu, JSON.stringify(data, null, 2));
}

const choices = ['🪨 Taş', '📄 Kağıt', '🪓 Makas'];
const simpleToEmoji = {
  rock: '🪨 Taş',
  paper: '📄 Kağıt',
  scissors: '🪓 Makas',
};
const emojiToSimple = {
  '🪨 Taş': 'rock',
  '📄 Kağıt': 'paper',
  '🪓 Makas': 'scissors',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('taş-kağıt-makas')
    .setDescription('Taş-Kağıt-Makas komutları')
    .addSubcommand(sub =>
      sub
        .setName('oyna')
        .setDescription('Bot ile Taş-Kağıt-Makas oyna.')
        .addStringOption(option =>
          option.setName("seçim")
            .setDescription("Taş, Kağıt ya da Makas")
            .setRequired(true)
            .addChoices(
              { name: "🪨 Taş", value: "🪨 Taş" },
              { name: "📄 Kağıt", value: "📄 Kağıt" },
              { name: "🪓 Makas", value: "🪓 Makas" }
            )
        )
        .addStringOption(option =>
          option.setName("zorluk")
            .setDescription("Botun zorluk seviyesini seç.")
            .addChoices(
              { name: "🟢 Kolay", value: "easy" },
              { name: "🔴 Zor", value: "hard" }
            )
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('top')
        .setDescription('Liderlik tablosunu gösterir.')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'oyna') {
      const userChoiceEmoji = interaction.options.getString('seçim');
      const difficulty = interaction.options.getString('zorluk') || "easy";
      const userChoice = emojiToSimple[userChoiceEmoji];

      let botChoice;
      const data = oku();
      const historyKey = `history_${interaction.user.id}`;
      const winsKey = `wins_${interaction.user.id}`;

      if (difficulty === "easy") {
        const kalanSecenekler = choices.filter(c => emojiToSimple[c] !== userChoice);
        botChoice = emojiToSimple[kalanSecenekler[Math.floor(Math.random() * kalanSecenekler.length)]];

        const randomChoices = ['rock', 'paper', 'scissors'].filter(c => c !== userChoice);
        botChoice = randomChoices[Math.floor(Math.random() * randomChoices.length)];
      } else {
        const history = data[historyKey] || [];

        const last = history[history.length - 1];
        if (last === 'rock') botChoice = 'paper';
        else if (last === 'paper') botChoice = 'scissors';
        else if (last === 'scissors') botChoice = 'rock';
        else botChoice = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];

        history.push(userChoice);
        if (history.length > 5) history.shift();
        data[historyKey] = history;
      }

      let result = '';
      if (userChoice === botChoice) {
        result = '<a:tokustur_arviis:997610185604485191> BERABERE! İkiniz de aynı seçimi yaptınız...';
      } else if (
        (userChoice === 'rock' && botChoice === 'scissors') ||
        (userChoice === 'paper' && botChoice === 'rock') ||
        (userChoice === 'scissors' && botChoice === 'paper')
      ) {
        result = '<a:mutlupanda_arviis:997610164544868454> KAZANDIN! Tebrikler.';
        const wins = data[winsKey] || 0;
        data[winsKey] = wins + 1;
      } else {
        result = '<:uzgunpanda_arviis:1050827763516444713> KAYBETTİN! Daha şanslı olabilirsin.';
      }

      yaz(data);

      const TKMEmbed = new EmbedBuilder()
        .setColor(0x00ffb7)
        .setTitle(result)
        .setDescription(`
<:girisok_arviis:1095682771168534668> Zorluk: ${difficulty === "hard" ? "**Zor ❤️**" : "**Kolay 💚**"}

## SENİN SEÇİMİN
\`\`\`txt
${simpleToEmoji[userChoice]}
\`\`\`

## BOTUN SEÇİMİ
\`\`\`txt
${simpleToEmoji[botChoice] || botChoice}
\`\`\`

-# <:modernsagok_arviis:1093852394317676634>Liderlik tablosunu görmek için \`/taş-kağıt-makas top\` komutunu kullanabilirsin.
      `);

      await interaction.reply({ embeds: [TKMEmbed] });

    } else if (subcommand === 'top') {
      const allData = oku();

      const leaderboard = Object.entries(allData)
        .filter(([key]) => key.startsWith("wins_"))
        .map(([key, value]) => ({
          userId: key.split('_')[1],
          wins: value
        }))
        .sort((a, b) => b.wins - a.wins)
        .slice(0, 10);

      const TKMTopEmbed = new EmbedBuilder().setColor(0x00ffb7);

      if (leaderboard.length === 0) {
        TKMTopEmbed
          .setTitle("🏆  Taş-Kağıt-Makas Liderlik Tablosu")
          .setDescription("Henüz kimse kazanmamış.");
        return interaction.reply({ embeds: [TKMTopEmbed] });
      }

      const users = await Promise.all(
        leaderboard.map(entry =>
          interaction.client.users.fetch(entry.userId).catch(() => null)
        )
      );

      const medals = ['🥇', '🥈', '🥉'];
      let leaderboardText = '';

      for (let i = 0; i < leaderboard.length; i++) {
        const username = users[i]?.username || 'Kişi bilinmiyor.';
        const prefix = medals[i] || `#${i + 1}`;
        leaderboardText += `**\`${prefix}\`** ${username} <:sadesagok_arviis:1109797490665996349> **${leaderboard[i].wins} kez** kazanmış.\n`;
      }

      TKMTopEmbed
        .setTitle("🏆  Taş-Kağıt-Makas Liderlik Tablosu")
        .setDescription(leaderboardText);

      await interaction.reply({ embeds: [TKMTopEmbed] });
    }
  },
};
