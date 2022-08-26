module.exports = {
    name: "resume",
    description: "Resume play music.",
    permissions: "0x0000000000000800",
    options: [],
    voiceChannel: true,
    run: async (client, interaction) => {
        const queue = client.player.getQueue(interaction.guild.id);
        if (!queue || !queue.playing) {
            return interaction.reply({
                content: `:x:| No music currently playing!`,
                ephemeral: true
            }).catch(e => { })
        }
        const success = queue.setPaused(false);
        return interaction.reply({
             content: success ? `▶  **${queue.current.title}**, Track resumed! ✅` : `:x:  Failed to do that! It's like you haven't stopped the music before.`
        }).catch(e => { })
    },
};
