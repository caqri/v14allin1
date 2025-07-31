const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const veriYolu = path.join(__dirname, '../Database/instagram.json');

function veriOku() {
  if (!fs.existsSync(veriYolu)) return {};
  try {
    return JSON.parse(fs.readFileSync(veriYolu, 'utf8'));
  } catch {
    return {};
  }
}

function veriYaz(data) {
  fs.writeFileSync(veriYolu, JSON.stringify(data, null, 2));
}


module.exports = async function instagramCommentHandler(interaction) {
  const instagramId = interaction.customId.replace("instagramcomment_modal_", "");
  const data = veriOku();
  const instagram = data[instagramId];
  const userId = interaction.user.id;

let instagramUrl;
if (interaction.options && interaction.options.getString) {
  instagramUrl = interaction.options.getString('instagram-hesap-url');
}

  if (!instagram)
    return interaction.reply({
      content: '<a:dikkat_arviis:997074866371039322> **Gönderi bulunamadı**.',
      flags: 64
    });

  if (!instagram.users) instagram.users = {};
  if (!instagram.users[userId])
    instagram.users[userId] = { liked: false, commented: false };

  if (instagram.users[userId].commented)
    return interaction.reply({
      content: '<:carpi_arviis:1046067681515814912> **Zaten yorum yapmışsın.**',
      flags: 64
    });

  const name = interaction.fields.getTextInputValue('comment_name');
  const comment = interaction.fields.getTextInputValue('comment_text');

  if (!instagram.yorumlar) instagram.yorumlar = [];
  instagram.yorumlar.push({ name, comment });
  instagram.comments++;
  instagram.users[userId].commented = true;


data[instagramId] = instagram;
veriYaz(data);

await interaction.reply({
    content: '<:bulut_arviis:1051904222150529094> Yorum **yapıldı.**',
    flags: 64
  });

const buttonsRow = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId(`instagramlike_${instagramId}`)
    .setLabel(`❤️ Beğeni: ${instagram.likes}`)
    .setStyle(ButtonStyle.Success),
  new ButtonBuilder()
    .setCustomId(`instagramcomment_${instagramId}`)
    .setLabel(`💬 Yorum: ${instagram.comments}`)
    .setStyle(ButtonStyle.Success),
  new ButtonBuilder()
    .setCustomId(`instagramshowcomments_${instagramId}`)
    .setLabel('Yorumları Göster')
    .setStyle(ButtonStyle.Primary)
);

const newComponents = [buttonsRow];

const oldLinkRow = interaction.message.components.find(row =>
  row.components.some(c => c.style === ButtonStyle.Link)
);

if (oldLinkRow) {
  newComponents.push(oldLinkRow);
} else if (instagram.instagramUrl && instagram.instagramUrl.startsWith('https://www.instagram.com/')) {
  const linkButtonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Instagram Profili')
      .setStyle(ButtonStyle.Link)
      .setEmoji("<:instagram2_arviis:1373764318515957800>")
      .setURL(instagram.instagramUrl)
  );
  newComponents.push(linkButtonRow);
}

if (interaction.message) {
  await interaction.message.edit({ components: newComponents });
}
};