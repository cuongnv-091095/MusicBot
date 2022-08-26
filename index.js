const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Player } = require('discord-player');
const config = require("./config")
const fs = require('fs');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // for guild related things
    GatewayIntentBits.GuildMembers, // for guild members related things
    GatewayIntentBits.GuildIntegrations, // for discord Integrations
    GatewayIntentBits.GuildVoiceStates, // for voice related things
    GatewayIntentBits.GuildMessages, // for guild messages things
    GatewayIntentBits.GuildMessageTyping, // for message typing things
    GatewayIntentBits.MessageContent // enable if you need message content things
  ],
})

client.config = config;
client.player = new Player(client, client.config.opt.discordPlayer);
const player = client.player

fs.readdir("./events", (_err, files) => {
  files.forEach((file) => {
    if (!file.endsWith(".js")) return;
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    console.log(`Loaded Event: ${eventName}`);
    client.on(eventName, event.bind(null, client));
    delete require.cache[require.resolve(`./events/${file}`)];
  });
});

client.commands = [];
fs.readdir(config.commandsDir, (err, files) => {
  if (err) throw err;
  files.forEach(async (f) => {
    try {
      let props = require(`${config.commandsDir}/${f}`);
      client.commands.push({
        name: props.name,
        description: props.description,
        options: props.options
      });
      console.log(`Loaded command: ${props.name}`);
    } catch (err) {
      console.log(err);
    }
  });
});


// player.on('trackStart', (queue, track) => {
//   if (queue) {
//     if (!client.config.opt.loopMessage && queue.repeatMode !== 0) return;
//     if (queue.metadata) {
//       queue.metadata.send({ content: `🎶 Now playing: **${track.title}** -> Channel: **${queue.connection.channel.name}** 🎧` }).catch(e => { });
//       client.user.setActivity(`🎶 ${track.title} in ${queue.connection.channel.name} 🎧`, {type: ActivityType.Playing });
//     }
//   }
// });

player.on('trackStart', (queue, track) => {
  if (queue) {
    if (!client.config.opt.loopMessage && queue.repeatMode !== 0) return;
    if (queue.metadata) {

      const embed = new EmbedBuilder();
      embed.setColor('Random');
      embed.setTitle(`🎶  Now Playing in 🎧 ${queue.connection.channel.name}`)
      embed.setDescription(`**${track.title}**`)
      embed.setThumbnail(track.thumbnail);
      embed.addFields(
          { name: "Duration", value: track.duration + "s", inline: true },
          { name: "Requester", value: track.requestedBy.username, inline: true },
          { name: "Views", value: track.views.toString(), inline: true },
          { name: "URL", value: `**[Click Here](${track.url})**`, inline: true },
          { name: "Uploader", value: track.author, inline: true },
      )
      embed.setFooter({text: `${client.user.username} | Created by ${client.users.cache.get(config.ownerID)?.tag}`, iconURL: client.user.avatarURL({ dynamic: true })})

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

      queue.metadata.send({ embeds: [embed], components: [row, row2],}).catch(e => { });
      client.user.setActivity(`🎶 ${track.title} in ${queue.connection.channel.name} 🎧`, {type: ActivityType.Playing });
    }
  }
});

player.on('trackAdd', (queue, track) => {
  if (queue) {
    if (queue.metadata) {
      const embed = new EmbedBuilder();
      embed.setColor('Random');
      embed.setTitle(`🎶 | New song added to queue ✅`)
      embed.setDescription(`${track.title}`)
      embed.setThumbnail(track.thumbnail);

      queue.metadata.send({embeds: [embed]}).catch(e => { });
    }
  }
});

player.on('channelEmpty', (queue) => {
  if (queue) {
    if (queue.metadata) {
      const embed = new EmbedBuilder();
      embed.setColor('Random');
      embed.setTitle(`🎶 I disconnected because there is no one left in my channel. :x:`)
      queue.metadata.send({embeds: [embed]}).catch(e => { }).catch(e => { });
      // queue.metadata.send({ content: `I disconnected because there is no one left in my channel. ❌` }).catch(e => { })
      client.user.setActivity(config.status, {type: ActivityType.Watching });
    }
  }
});

player.on('queueEnd', (queue) => {
  if (client.config.opt.voiceConfig.leaveOnTimer.status === true) {
    if (queue) {
      setTimeout(() => {
        if (queue.connection) {
          if (!queue.playing) { //additional check in case something new was added before time was up
            queue.connection.disconnect()
          }
        };
      }, client.config.opt.voiceConfig.leaveOnTimer.time);
    }
    if (queue.metadata) {
      const embed = new EmbedBuilder();
      embed.setColor('Random');
      embed.setTitle(`🎶 Queue is empty. You can play some more music. ✅`)
      queue.metadata.send({embeds: [embed]}).catch(e => { }).catch(e => { });
      // queue.metadata.send({ content: `Queue is empty. You can play some more music. ✅` }).catch(e => { })
    }
    client.user.setActivity(config.status, {type: ActivityType.Watching });
  }
});

player.on("error", (queue, error) => {
  if (queue) {
    if (queue.metadata) {
      const embed = new EmbedBuilder();
      embed.setColor('Random');
      embed.setTitle(`:x:  I'm having trouble connecting to the voice channel. ${error}`)
      queue.metadata.send({embeds: [embed]}).catch(e => { }).catch(e => { });
      // queue.metadata.send({ content: `I'm having trouble connecting to the voice channel. ❌ | ${error}` }).catch(e => { })
      client.user.setActivity(config.status, {type: ActivityType.Watching });
    }
  }
})

if (config.TOKEN || process.env.TOKEN) {
  client.login(config.TOKEN || process.env.TOKEN).catch(e => {
    console.log("The Bot Token You Entered Into Your Project Is Incorrect Or Your Bot's INTENTS Are OFF!")
  })
} else {
  setTimeout(() => {
    console.log("Please set the bot token in token.js or in your .env file in your project!")
  }, 2000)
}

setTimeout(async () => {
  const db = require("croxydb")
  await db.delete("queue")
  await db.delete("loop")
}, 2000)

const express = require("express");
const app = express();
const http = require("http");
app.get("/", (request, response) => {
  response.sendStatus(200);
});
app.listen(process.env.PORT);
