module.exports = {
    TOKEN: "MTAxMDI4NDgxNzgxMzg2NDQ5OA.GQIib_.1Sz_orBFNoTSr0I38h2vMTjnUBoED2na5rq0Tc",
    ownerID: "999151112579989504", //write your discord user id.
    botInvite: "https://discord.com/oauth2/authorize?client_id=1010284817813864498&permissions=8&scope=bot%20applications.commands", //write your discord bot invite.
    status: 'CươngNV ❤️ DIYEverything.xyz',
    commandsDir: './commands', //Please don't touch

    opt: {
        DJ: {
            commands: ['back', 'clear', 'filter', 'loop', 'pause', 'resume', 'skip', 'stop', 'volume'] //Please don't touch
        },

        voiceConfig: {
            leaveOnEnd: false, //If this variable is "true", the bot will leave the channel the music ends.
            autoSelfDeaf: false, //IF YOU WANT TO DEAF THE BOT, set false to true.

            leaveOnTimer: { //The leaveOnEnd variable must be "false" to use this system.
                status: true, //If this variable is "true", the bot will leave the channel when the bot is offline.
                time: 20000, //1000 = 1 second
            }
        },

        maxVol: 100, //You can specify the maximum volume level.
        loopMessage: false,

        discordPlayer: {
            ytdlOptions: {
                quality: 'highestaudio', //Please don't touch
                highWaterMark: 1 << 25 //Please don't touch
            }
        }
    }
}
