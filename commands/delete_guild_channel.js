const db = require("croxydb");
module.exports = {
    name: 'reset_commands_channel',
    description: 'Remove the commands channel restriction from your server',
    permissions: "0x0000000000000008",
    options: [],
    run: async (client, interaction) => {
        const guild = interaction.guild.id;
        if ( !interaction.member.permissions.has("MANAGE_CHANNELS")) {
            return interaction.reply({
                content: `:x: | Manage Channels Permission is required to perform that action!`,
                ephemeral: true,
            })
        }
        if (db.has(`${guild}_cmd_channel`) === false) {
            return interaction.reply({
                content: `:x: | Your guild currently has no commands channel!`,
                ephemeral: true,
            })
        }
        const success = await db.delete(`${guild}_cmd_channel`);
        return interaction.reply({
            content: success ? `:white_check_mark: | Successfully cleared your guilds command channel , commands can now be used anywhere!` : `:x: | Failed to do that`
        })
    }
}