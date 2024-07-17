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



client.login(process.env.BOT_TOKEN);
