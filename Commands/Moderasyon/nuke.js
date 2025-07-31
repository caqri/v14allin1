const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nuke')
    .setDescription('Kanalı patlatır.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.channel;

    await interaction.reply({ content: '<a:yukleniyor_arviis:1058007845364322354> Kanal sıfırlanıyor...', flags: 64 });

    try {
      const cloned = await channel.clone({
        name: channel.name,
        type: channel.type,
        topic: channel.topic,
        nsfw: channel.nsfw,
        bitrate: channel.bitrate,
        userLimit: channel.userLimit,
        rateLimitPerUser: channel.rateLimitPerUser,
        permissionOverwrites: channel.permissionOverwrites.cache.map(perm => ({
          id: perm.id,
          allow: perm.allow.bitfield,
          deny: perm.deny.bitfield,
          type: perm.type,
        }))
      });

      await interaction.followUp({
        content: `<:tik_arviis:1046067679884234863> Kanal yeniden **oluşturuldu.** \n\n<:hashtag_arviis:1051904217478070276> <#${cloned.id}>`,
        flags: 64
      });

      await channel.delete();

      await cloned.send({
        content: `<a:nuke_arviis:1375540066109100116> Kanal **sıfırlandı.**`,
      });

    } catch (error) {
      console.error('Nuke hatası:', error);
      try {
        await interaction.followUp({
          content: '<a:dikkat_arviis:997074866371039322> **Kanal yeniden oluşturulurken hata oluştu.**',
          flags: 64
        });
      } catch (err) {
        console.error('FollowUp başarısız:', err);
      }
    }
  }
};
