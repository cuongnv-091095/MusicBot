const { ApplicationCommandOptionType } = require('discord.js');
const db = require("croxydb");
module.exports = {
  name: "commands_channel",
  description: "Set the commands channel , after this my commands can only be executed in the channel you set",
  permissions: "0x0000000000000008",
  options: [{
    name: "channel",
    description: "The channel you want to set as main commands channel",
    type: ApplicationCommandOptionType.Channel,
    required: true,
  }],
  run: async (client, interaction) => {
    const channel = interaction.options.getChannel('channel');
    const guild = interaction.guild.id;
    if ( !interaction.member.permissions.has("MANAGE_CHANNELS")) {
        return interaction.reply({
            content: `:x: | Manage Channels Permission is required to perform that action!`,
            ephemeral: true,
        })
    }
    const success = await db.set(`${guild}_cmd_channel`, channel.id);
    return interaction.reply({
        content: success ? `:white_check_mark: | Successfully set <#${channel.id}> as your guild's command channel` : `:x: | Failed to do that`
    })
  }
}