const config = require("../config.js");
module.exports = async (client) => {

    const { REST } = require("@discordjs/rest");
    const { Routes } = require("discord-api-types/v10");
    const rest = new REST({ version: "10" }).setToken(config.TOKEN || process.env.TOKEN);
    (async () => {
        try {
            await rest.put(Routes.applicationCommands(client.user.id), {
                body: await client.commands,
            });
            console.log("Successfully reloaded application [/] commands.");
        } catch (err) {
            console.log("Error reloading application [/] commands: " + err);
        }
    })();
    console.log(client.user.username + " successfully connected.");
    console.log(`
npm uni discord-player
npm i discord-player@5.3.0-dev.2
npm uni ytdl-core
npm i ytdl-core@4.10.0
`)
    
client.user.setStatus('ONLINE');
client.user.setActivity(config.status)

}
