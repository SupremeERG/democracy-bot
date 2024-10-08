// deploys the smart contract
const { SlashCommandBuilder } = require('discord.js');
const fs = require("node:fs");
const { Web3 } = require("web3");
const { ethers, ContractFactory, Wallet } = require("ethers");
const eventHandler = require("../../handlers/events.js");
const appConfig = require("../../config.json")
module.exports = {
    enabled: true,
    cooldown: 0,
    data: new SlashCommandBuilder()
        .setName('deploy')
        .setDescription('Deploys the Ballot smart contract onto the Ethereum network'),
    async execute(client, interaction) {
        await interaction.deferReply({ ephemeral: true }) // necessary because discord.js requires you to reply to an interaction within 3 seconds

        const provider = new ethers.providers.JsonRpcProvider(appConfig.RPC_ENDPOINT);
        const defaultAccount = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const contractData = JSON.parse(fs.readFileSync("contracts/build/ballot.json"))


        const factory = new ContractFactory(contractData.abi, contractData.bytecode, defaultAccount);

        // If your contract requires constructor args, you can specify them here
        const contract = await factory.deploy();

        appConfig.contractAddress = contract.address;
        fs.writeFile("config.json", JSON.stringify(appConfig, null, 2), (error) => {
            if (error) return console.log(error), interaction.editReply("There was an error updating my contract database. Please try again.");
        })

        await eventHandler.restartListener(client, contract);
        await interaction.editReply(`The contract was deployed at ${contract.address}`)
    },
};