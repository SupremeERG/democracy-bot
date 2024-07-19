require("dotenv").config()
const fs = require("fs");
const path = require('node:path');
const discord = require('discord.js');
const cmdHandler = require("./handlers/command.js")
const eventHandler = require("./handlers/events.js");
const { ethers } = require("ethers");
const contractData = JSON.parse(fs.readFileSync("contracts/build/ballot.json"));
const client = new discord.Client({ intents: [discord.GatewayIntentBits.Guilds] });

client.commands = new discord.Collection();
client.cooldowns = new discord.Collection();
cmdHandler.initialize(client.commands);

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_ENDPOINT);
const defaultAccount = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractData.abi, defaultAccount)

eventHandler.listen(client, contract)


client.login(process.env.BOT_TOKEN);

