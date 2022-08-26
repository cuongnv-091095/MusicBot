module.exports = {
    name: "pause",
    description: "Pause play music.",
    permissions: "0x0000000000000800",
    options: [],
    voiceChannel: true,
    run: async (client, interaction) => {
        const queue = client.player.getQueue(interaction.guild.id);
        if (!queue || !queue.playing) {
            return interaction.reply({
                content: `:x:  No music currently playing!`,
                ephemeral: true
            }).catch(e => { })
        }
        const success = queue.setPaused(true);
            return interaction.reply({
                content: success ? `⏸  **${queue.current.title}** - music paused! ✅` : `:x:  Failed to pause`
            }).catch(e => { })
    },
}
