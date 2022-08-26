const { ApplicationCommandOptionType } = require('discord.js');
const maxVol = require("../config.js").opt.maxVol;
module.exports = {
    name: "volume",
    description: "Allows you to adjust the music volume.",
    permissions: "0x0000000000000800",
    options: [{
        name: 'volume',
        description: 'Type the number to adjust the volume.',
        type: ApplicationCommandOptionType.Integer,
        required: true
    }],
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
                content: `:x:  There is no music currently playing!`,
                ephemeral: true
            }).catch(e => { })
        }
        const vol = parseInt(interaction.options.getInteger('volume'));
        if (!vol) {
            return interaction.reply({
                content: `🔊  Current volume: **${queue.volume}** \n**To change the volume, with \`1\` to \`${maxVol}\` Type a number between.**`,
                ephemeral: true
            }).catch(e => { })
        }
        if (queue.volume === vol) {
            return interaction.reply({
                content: `:x:  The volume you want to change is already the current volume`,
                ephemeral: true
            }).catch(e => { })
        }
        if (vol < 0 || vol > maxVol) {
            return interaction.reply({
                content: `:x:  **Type a number from \`1\` to \`${maxVol}\` to change the volume .**`,
                ephemeral: true
            }).catch(e => { })
        }
        const success = queue.setVolume(vol);
        return interaction.reply({
            content: success ? `🔊  Volume changed: **${vol}**/**${maxVol}**` : `Something went wrong. ❌`
        }).catch(e => { })
    },
};
