module.exports = {
    name: "clear",
    description: "Clears the music queue.",
    permissions: "0x0000000000000800",
    options: [],
    voiceChannel: true,
    run: async (client, interaction) => {
        const queue = client.player.getQueue(interaction.guild.id);

        if (!queue || !queue.playing) return interaction.reply({ content: `:x:  No music currently playing.`, ephemeral: true }).catch(e => { })

        if (!queue.tracks[0]) return interaction.reply({ content: `:x:  The queue is empty.`, ephemeral: true }).catch(e => { })

        await queue.clear();

        interaction.reply({ content: `🗑️  The queue has just been cleared.` }).catch(e => { })
    },
}
