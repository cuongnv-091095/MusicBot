module.exports = {
    name: "skip",
    description: "Plays the next track in queue.",
    permissions: "0x0000000000000800",
    options: [],
    voiceChannel: true,
    run: async (client, interaction) => {
        const queue = client.player.getQueue(interaction.guild.id);
        const player = interaction.client.player;
        if (!interaction.member.voice.channel) {
            return interaction.reply({
                content: `:x:  You need to be in a voice channel to do that!`,
                ephemeral: true,
            }).catch(e => { });
        }
        const guild_me = interaction.guild.members.cache.get(client.user.id);
        if (guild_me.voice.channelId) {
            if (guild_me.voice.channelId !== interaction.member.voice.channelId) {
                return interaction.reply({
                    content: `:x:  You need to be in the same voice channel as me to do that`,
                    ephemeral: true
                }).catch(e => { })
            }
        }
        if (!queue || !queue.playing) {
            return interaction.reply({
                content: `:x:  No music currently playing!`,
                ephemeral: true
            }).catch(e => { })
        }
        if (queue.tracks < 1) {
            return interaction.reply({
                content: `:x:  Only 1 song in your queue`
            }).catch(e => { })
        }
        const success = queue.skip();
        return interaction.reply({
            content: success ? `⏭  Skipped **${queue.current.title}**` : `:x:  Failed to do that!`,
            ephemeral: true
        }).catch(e => { });
    },
};
