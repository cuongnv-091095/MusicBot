module.exports = {
    name: "back",
    description: "Plays the previous track.",
    permissions: "0x0000000000000800",
    options: [],
    voiceChannel: true,
    run: async (client, interaction) => {
        const queue = client.player.getQueue(interaction.guildId);
        if (!queue || !queue.playing) {
            return interaction.reply({
                content: `:x:  No music currently playing!`,
                ephemeral: true
            }).catch(e => { })
        }
        if (queue.previousTracks > 1) {
            const success = queue.back();
            return interaction.reply({
                content: success ? `⏮️  Now Playing the previous track from your queue!` : `:x: | Failed to do that!`,
                ephemeral: true
            }).catch(e => { })
        } else {
            return interaction.reply({ content: `:x:  There is no previous track in queue!`, ephemeral: true }).catch(e => { })
        }
    },
};
