const fs = require("fs")
const config = require("../config.js");
const { EmbedBuilder, InteractionType } = require('discord.js');
const db = require("croxydb");
const maxVol = require("../config.js").opt.maxVol;
let prevol;

module.exports = async (client, interaction) => {
    if (!interaction.guild) return;
    if (interaction.type === InteractionType.ApplicationCommand) {
        fs.readdir(config.commandsDir, (err, files) => {
            if (err) throw err;
            files.forEach(async (f) => {
                let props = require(`.${config.commandsDir}/${f}`);
                if (interaction.commandName.toLowerCase() === props.name.toLowerCase()) {
                    try {
                        if (interaction.member.permissions.has(props?.permissions || "0x0000000000000800")) {
                            const DJ = client.config.opt.DJ;
                            const { guildId: guild, channelId } = interaction;
                            if (props && DJ.commands.includes(interaction.commandName)) {
                                let djRole = await db.get(`dj-${interaction.guild.id}`)
                                if (djRole) {
                                    const roleDJ = interaction.guild.roles.cache.get(djRole)
                                    if (!interaction.member.permissions.has("0x0000000000000020")) {
                                        if (roleDJ) {
                                            if (!interaction.member.roles.cache.has(roleDJ.id)) {

                                                const embed = new EmbedBuilder()
                                                    .setColor('007fff')
                                                    .setTitle(client.user.username)
                                                    .setThumbnail(client.user.displayAvatarURL())
                                                    .setDescription("You must have the <@&" + djRole + ">(DJ) role set on this server to use this command. Users without this role cannot use the " + client.config.opt.DJ.commands.map(astra => '`' + astra + '`').join(", "))
                                                    .setTimestamp()
                                                    .setFooter({ text: `Bot customize by CươngNV from DIYEverything.xyz with ❤️` })
                                                return interaction.reply({ embeds: [embed], ephemeral: true }).catch(e => { })
                                            }
                                        }
                                    }
                                }
                            }
                            if (props && props.voiceChannel) {
                                if (!interaction.member.voice.channelId) return interaction.reply({ content: `:x:  You need to be in a voice channel to do that!`, ephemeral: true }).catch(e => { })
                                const guild_me = interaction.guild.members.cache.get(client.user.id);
                                if (guild_me.voice.channelId) {
                                    if (guild_me.voice.channelId !== interaction.member.voice.channelId) {
                                        return interaction.reply({ content: `:x:  You need to be in the same voice channel as me to do that!`, ephemeral: true }).catch(e => { })
                                    }
                                }
                            }

                            if (db.has(`${guild}_cmd_channel`)) {
                                const cmdChannel = db.get(`${guild}_cmd_channel`);
                                const chan = client.channels.cache.get(cmdChannel);
                                if (cmdChannel !== channelId) {
                                    return interaction.reply({
                                        content: `My commands are limited to ${chan} in your guild!`,
                                        ephemeral: true,
                                    });
                                }
                            }
                            const roll = db.has(`${guild}_bl_role`);
		                    if (roll) {
			                    const rolee = db.get(`${guild}_bl_role`);
			                    if (interaction.member.roles.cache.some((role) => role.id === rolee)) {
				                    return interaction.reply(`You have been blacklisted from using me!`);
			                    }
		                    }

                            return props.run(client, interaction);

                        } else {
                            return interaction.reply({ content: `Missing permission: **${props?.permissions}**`, ephemeral: true });
                        }
                    } catch (e) {
                        console.log(e);
                        return interaction.reply({ content: `Something went wrong...\n\n\`\`\`${e.message}\`\`\``, ephemeral: true });
                    }
                }
            });
        });
    }

    if (interaction.type === InteractionType.MessageComponent) {
        const queue = client.player.getQueue(interaction.guildId);
        switch (interaction.customId) {
            case 'saveTrack': {
                if (!queue || !queue.playing) {
                    return interaction.reply({ content: `No music currently playing. ❌`, embeds: [], components: [], ephemeral: true }).catch(e => { })
                } else {
                    const embed = new EmbedBuilder()
                        .setColor('007fff')
                        .setTitle(client.user.username + " - Save Track")
                        .setThumbnail(client.user.displayAvatarURL())
                        .addFields([
                            { name: `Track`, value: `\`${queue.current.title}\`` },
                            { name: `Duration`, value: `\`${queue.current.duration}\`` },
                            { name: `URL`, value: `${queue.current.url}` },
                            { name: `Saved Server`, value: `\`${interaction.guild.name}\`` },
                            { name: `Requested By`, value: `${queue.current.requestedBy}` }
                        ])
                        .setTimestamp()
                        .setFooter({ text: `Bot customize by CươngNV from DIYEverything.xyz with ❤️` })
                    interaction.member.send({ embeds: [embed] }).then(() => {
                        return interaction.reply({ content: `I sent you the name of the music in a private message ✅`, embeds: [], components: [], ephemeral: true }).catch(e => { })
                    }).catch(error => {
                        return interaction.reply({ content: `I can't send you a private message. ❌`, embeds: [], components: [], ephemeral: true }).catch(e => { })
                    });
                }
            }
                break
            case 'time': {
                if (!queue || !queue.playing) {
                    return interaction.reply({ content: `No music currently playing. ❌`, embeds: [], components: [], ephemeral: true }).catch(e => { })
                } else {

                    const progress = queue.createProgressBar();
                    const timestamp = queue.getPlayerTimestamp();

                    if (timestamp.progress == 'Infinity') return interaction.message.edit({ content: `This song is live streaming, no duration data to display. 🎧`, embeds: [], components: [] }).catch(e => { })

                    const embed = new EmbedBuilder()
                        .setColor('007fff')
                        .setTitle(queue.current.title)
                        .setThumbnail(client.user.displayAvatarURL())
                        .setTimestamp()
                        .setDescription(`${progress} (**${timestamp.progress}**%)`)
                        .setFooter({ text: `Bot customize by CươngNV from DIYEverything.xyz with ❤️` })
                    interaction.message.edit({ embeds: [embed] }).catch(e => { })
                    interaction.reply({ content: `**✅ Success:** Time data updated. `, embeds: [], components: [], ephemeral: true }).catch(e => { })
                }
            }
                break
            case 'pause': {
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
                const success = queue.setPaused(true);
                return interaction.reply({
                    content: success ? `⏸  **${queue.current.title}** - music paused! ✅` : `:x:  Failed to pause`
                }).catch(e => { })
            }
                break
            case 'resume': {
                const player = interaction.client.player;
                if (!interaction.member.voice.channel) {
                    return interaction.reply({
                        content: `:x:   You need to be in a voice channel to do that!`,
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
                        content: `:x:| No music currently playing!`,
                        ephemeral: true
                    }).catch(e => { })
                }
                const success = queue.setPaused(false);
                return interaction.reply({
                    content: success ? `▶  **${queue.current.title}**, Track resumed! ✅` : `:x:  Failed to do that! It's like you haven't stopped the music before.`
                }).catch(e => { })
            }
                break
            case 'stop': {
                const player = interaction.client.player;
                if (!interaction.member.voice.channel) {
                    return interaction.reply({
                        content: `:x:   You need to be in a voice channel to do that!`,
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
                queue.destroy();
                return interaction.reply({
                    content: `🛑  Successfully Stopped the music. See you next time!`
                }).catch(e => { })
            }
                break
            case 'back': {
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
                if (queue.previousTracks > 1) {
                    const success = queue.back();
                    return interaction.reply({
                        content: success ? `⏮️  Now Playing the previous track from your queue!` : `:x: | Failed to do that!`,
                        ephemeral: true
                    }).catch(e => { })
                } else {
                    return interaction.reply({ content: `:x:  There is no previous track in queue!`, ephemeral: true }).catch(e => { })
                }
            }
                break
            case 'skip': {
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
            }
                break
            case 'mute': {
                const player = interaction.client.player;
                if (!interaction.member.voice.channel) {
                    return interaction.reply({
                        content: `:x:   You need to be in a voice channel to do that!`,
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
                if (queue) {
                    if (queue.volume === 0 || queue.volume < 0 ) {
                        return interaction.reply({ content: `:x:  Already Muted`, ephemeral: true }).catch(e => { })
                    } else {
                        prevol = queue.volume;
                        const success = queue.setVolume(0);
                        return interaction.reply({ content: success ? `🔇  Muted` : `Something went wrong. ❌` }).catch(e => { })
                    }
                }
            }
                break
            case 'unmute': {
                const player = interaction.client.player;
                if (!interaction.member.voice.channel) {
                    return interaction.reply({
                        content: `:x:   You need to be in a voice channel to do that!`,
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
                if (queue) {
                    if (queue.volume === 0) {
                        const success = queue.setVolume(prevol);
                        return interaction.reply({
                            content: success ? `🔈  Unmuted - Volume: **${prevol}**/**${maxVol}**` : `Something went wrong. ❌`
                        }).catch(e => { })
                    } else {
                        prevol = maxVol;
                        const success = queue.setVolume(prevol);
                        return interaction.reply({
                            content: success ? `🔊  Volume set to Max: **${prevol}**/**${maxVol}**` : `Something went wrong. ❌`
                        }).catch(e => { })
                    }
                }
            }
                break
            case 'voldown': {
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
                if (queue) {
                    if (queue.volume === 0) {
                        return interaction.reply({
                            content: `:x:  Already Muted`,
                            ephemeral: true
                        }).catch(e => {})
                    }
                    if (queue.volume < 10 || queue.volume == 10) {
                        prevol = 0;
                        const success = queue.setVolume(prevol);
                        return interaction.reply({
                            content: success ? `🔉  Volume changed: **${prevol}**/**${maxVol}**` : `Something went wrong. ❌`
                        }).catch(e => { })
                    } else if (queue.volume < maxVol || queue.volume == maxVol) {
                        const vol = queue.volume;
                        prevol = (vol - 10);
                        const success = queue.setVolume(prevol);
                        return interaction.reply({
                            content: success ? `🔉  Volume changed: **${prevol}**/**${maxVol}**` : `Something went wrong. ❌`
                        }).catch(e => { })
                    }
                }
            }
                break
            case 'volup': {
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
                if (queue) {
                    if (queue.volume === maxVol) {
                        return interaction.reply({
                            content: `:x:  Maxed Volume`,
                            ephemeral: true
                        }).catch(e => {})
                    }
                    if (queue.volume > (maxVol - 10) || queue.volume == (maxVol - 10)) {
                        prevol = 100;
                        const success = queue.setVolume(prevol);
                        return interaction.reply({
                            content: success ? `🔊  Volume changed: **${prevol}**/**${maxVol}**` : `Something went wrong. ❌`
                        }).catch(e => { })
                    } else if (queue.volume > 0 || queue.volume == 0) {
                        const vol = queue.volume;
                        prevol = (vol + 10);
                        const success = queue.setVolume(prevol);
                        return interaction.reply({
                            content: success ? `🔊  Volume changed: **${prevol}**/**${maxVol}**` : `Something went wrong. ❌`
                        }).catch(e => { })
                    }
                }
            }
                break
        }
    }

}
