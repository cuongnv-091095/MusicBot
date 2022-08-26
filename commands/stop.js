module.exports = {
    name: "stop",
    description: "Stop play music.",
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
        queue.destroy();
        return interaction.reply({
            content: `🛑  Successfully Stopped the music. See you next time!`
        }).catch(e => { })
    },
};
