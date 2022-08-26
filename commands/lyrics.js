const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const finder = require("lyrics-finder");
module.exports = {
    name: "lyrics",
    description: "Get the lyrics of current playing song!",
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
        if (queue) {
            let lyrics = null;
            let track = queue.nowPlaying();
            track = track.title;
            try {
                lyrics = await finder(track, "");
                if (!lyrics) lyrics = `:x: | No lyrics found.`;
            } catch (error) {
                lyrics = `:x: No Lyrics Found`;
            }
            const lyricsEmbed = new EmbedBuilder();
            lyricsEmbed.setColor('Random');
            lyricsEmbed.setTitle(`✍  Lyric for ${track}`)
            lyricsEmbed.setDescription(lyrics)
            lyricsEmbed.setThumbnail(`${queue.nowPlaying().thumbnail}`);
            // if (lyricsEmbed.description.length >= 4096)
            //     lyricsEmbed.description = `${lyricsEmbed.description.substr(
            //         0,
            //         4095
            //     )}...`;
            return interaction.reply({
                embeds: [lyricsEmbed],
                ephemeral: true,
            }).catch(e => { });
        }
    }
}