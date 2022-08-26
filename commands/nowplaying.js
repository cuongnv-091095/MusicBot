const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { QueueRepeatMode } = require('discord-player');
module.exports = {
    name: "nowplaying",
    description: "Provides information about the music being played.",
    permissions: "0x0000000000000800",
    options: [],
    run: async (client, interaction) => {
        const queue = client.player.getQueue(interaction.guild.id);

        if (!queue || !queue.playing) return interaction.reply({ content: `There is no music currently playing!. ❌`, ephemeral: true }).catch(e => { })

        const track = queue.current;
        // const methods = ['track'];
        let rp;
        if (queue.repeatMode === 0) {
            rp = 'OFF';
        } else if (queue.repeatMode === 1) {
            rp = 'Track'
        } else if (queue.repeatMode === 2) {
            rp = 'Queue'
        } else if (queue.repeatMode === 3) {
            rp = 'Autoplay'
        }

        const embed = new EmbedBuilder();
        embed.setColor('Random');
        embed.setTitle(`🎶  Now Playing in 🎧 ${queue.connection.channel.name}`);
        embed.setDescription(`**${track.title}**`);
        embed.setThumbnail(track.thumbnail);
        embed.addFields(
            { name: "Uploader", value: track.author, inline: true },
            { name: "Duration", value: track.duration + "s", inline: true },
            { name: "Requested By", value: track.requestedBy.username, inline: true },
            { name: "Views", value: track.views.toString(), inline: true },
            { name: "Loop Mode", value: rp, inline: true },
            { name: "Progress Bar", value: queue.createProgressBar({ timecodes: true })},
        );

        embed.setFooter({ text: "Bot custom by CươngNV from DIYEverything.xyz with ❤️" });

        const saveButton = new ButtonBuilder();
        saveButton.setLabel('📥');
        saveButton.setCustomId('saveTrack');
        saveButton.setStyle(ButtonStyle.Success);

        const backButton = new ButtonBuilder();
        backButton.setLabel('⏮️');
        backButton.setCustomId('back');
        backButton.setStyle(ButtonStyle.Primary);

        const skipButton = new ButtonBuilder();
        skipButton.setLabel('⏭️');
        skipButton.setCustomId('skip');
        skipButton.setStyle(ButtonStyle.Primary);

        const pauseButton = new ButtonBuilder();
        pauseButton.setLabel('⏸️');
        pauseButton.setCustomId('pause');
        pauseButton.setStyle(ButtonStyle.Success);

        const resumeButton = new ButtonBuilder();
        resumeButton.setLabel('▶️');
        resumeButton.setCustomId('resume');
        resumeButton.setStyle(ButtonStyle.Success);

        const stopButton = new ButtonBuilder();
        stopButton.setLabel('⏹️');
        stopButton.setCustomId('stop');
        stopButton.setStyle(ButtonStyle.Success);

        const muteButton = new ButtonBuilder();
        muteButton.setLabel('🔇');
        muteButton.setCustomId('mute');
        muteButton.setStyle(ButtonStyle.Danger);

        const unmuteButton = new ButtonBuilder();
        unmuteButton.setLabel('🔈');
        unmuteButton.setCustomId('unmute');
        unmuteButton.setStyle(ButtonStyle.Danger);

        const voldownButton = new ButtonBuilder();
        voldownButton.setLabel('🔉');
        voldownButton.setCustomId('voldown');
        voldownButton.setStyle(ButtonStyle.Success);

        const volupButton = new ButtonBuilder();
        volupButton.setLabel('🔊');
        volupButton.setCustomId('volup');
        volupButton.setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(backButton, pauseButton, resumeButton, stopButton, skipButton);
        const row2 = new ActionRowBuilder().addComponents(muteButton, voldownButton, saveButton, volupButton, unmuteButton);

        interaction.reply({ embeds: [embed], components: [row, row2] }).catch(e => { })
    },
};
