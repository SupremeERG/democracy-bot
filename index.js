require("dotenv").config()
const fs = require("fs");
const path = require('node:path');
const discord = require('discord.js');
const cmdHandler = require("./handlers/command.js")
const eventHandler = require("./handlers/events.js");

const client = new discord.Client({ intents: [discord.GatewayIntentBits.Guilds] });

client.commands = new discord.Collection();
client.cooldowns = new discord.Collection();
cmdHandler.initialize(client.commands);


eventHandler.listen(client)



client.once(discord.Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(process.env.BOT_TOKEN);
