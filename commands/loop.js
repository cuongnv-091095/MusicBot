const { QueueRepeatMode } = require('discord-player');
const { ApplicationCommandOptionType } = require('discord.js');
module.exports = {
  name: "loop",
  description: "Setup loop mode.",
  permissions: "0x0000000000000800",
  options: [{
        name: 'mode',
        description: "Choose loop mode.",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
            {name: 'Off', value: 'OFF'},
            {name: 'Queue', value: 'QUEUE'},
            {name: 'Track', value: 'TRACK',}
        ]
  }],
  voiceChannel: true,
  run: async (client, interaction) => {
    const queue = client.player.getQueue(interaction.guild.id);
    if (!queue || !queue.playing) {
        return interaction.reply({
            content: `:x:  No music currently playing!`,
            ephemeral: true
        }).catch(e => { })
    }
    if (queue) {
        const loop = interaction.options.getString("mode");
        if (loop === "OFF") {
            const success = await queue.setRepeatMode(QueueRepeatMode.OFF);
            return interaction.reply({
                content: success ? `🔁  Successfully set the loop mode to **${loop}**` : `:x:  Failed to do that`
            })
        } else if (loop === "TRACK") {
            const success = await queue.setRepeatMode(QueueRepeatMode.TRACK);
            return interaction.reply({
                content: success ? `🔁  Successfully set the loop mode to **${loop}**` : `:x:  Failed to do that`
            })
        } else if (loop === "QUEUE") {
            const success = await queue.setRepeatMode(QueueRepeatMode.QUEUE);
            return interaction.reply({
                content: success ? `🔁  Successfully set the loop mode to **${loop}**` : `:x:  Failed to do that`
            })
        }
    }
  }
}