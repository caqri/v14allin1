const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName("meme")
        .setDescription("Çeşitli meme (mim)'ler verir.")
        .addStringOption(option =>
            option.setName("platform")
                .setDescription("Platform seç")
                .addChoices(
                    { name: "Giphy", value: "giphy" },
                    { name: "MemeAPI", value: "memeapi" } 
                )
        ),

    async execute(interaction) {
        await interaction.deferReply(); 

        const { guild, options } = interaction;
        const platform = options.getString("platform");

        const embed = new EmbedBuilder();

        async function giphyMeme() {
            try {
                const res = await fetch('https://api.giphy.com/v1/gifs/random?api_key=lYBciWOvaOhVPNzGy4J8mUXNpC53YNbz&tag=&rating=g');
                const meme = await res.json();
                const data = meme.data;

                embed
                    .setAuthor({ name: "Giphy", iconURL: guild.iconURL({ dynamic: true }) })
                    .setTitle(data.title || "Giphy Meme")
                    .setImage(data.images.original.url)
                    .setURL(data.url)
                    .setDescription(data.user?.display_name ? `Paylaşan: **${data.user.display_name}**` : "🔄 Giphy'den rastgele seçildi.")
                    .setColor(0x00ffb7);

                await interaction.editReply({ embeds: [embed] });

            } catch (error) {
                console.error(error);
                await interaction.editReply({ content: "<:carpi_arviis:1046067681515814912> Bir hata oluştu. Lütfen tekrar dene.", flags: 64 });
            }
        }

        async function memeApiMeme() {
            try {
                const res = await fetch('https://meme-api.com/gimme');
                const meme = await res.json();

                embed
                    .setAuthor({ name: "Meme API", iconURL: guild.iconURL({ dynamic: true }) })
                    .setTitle(meme.title || "Meme")
                    .setImage(meme.url)
                    .setURL(meme.postLink)
                    .setDescription(`Paylaşan: **u/${meme.author}**`)
                    .setColor(0x00ffb7);

                await interaction.editReply({ embeds: [embed] });

            } catch (error) {
                console.error(error);
                await interaction.editReply({ content: "<:carpi_arviis:1046067681515814912> Bir hata oluştu. Lütfen tekrar dene.", flags: 64 });
            }
        }

        if (platform === "giphy") return await giphyMeme();
        if (platform === "memeapi") return await memeApiMeme();

        const memes = [giphyMeme, memeApiMeme];
        const random = memes[Math.floor(Math.random() * memes.length)];
        await random();
    }
};
