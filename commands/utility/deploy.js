// deploys the smart contract
const { SlashCommandBuilder } = require('discord.js');
const fs = require("node:fs");
const { Web3 } = require("web3");
const { ethers, ContractFactory, Wallet } = require("ethers");

module.exports = {
    cooldown: 60,
    data: new SlashCommandBuilder()
        .setName('deploy')
        .setDescription('Deploys the Ballot smart contract onto the Ethereum network'),
    async execute(interaction) {
        await interaction.deferReply({ephemeral: true}) // necessary because discord.js requires you to reply to an interaction within 3 seconds

        const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_ENDPOINT);
        const defaultAccount = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const contractData = JSON.parse(fs.readFileSync("contracts/build/ballot.json"))


        const factory = new ContractFactory(contractData.abi, contractData.bytecode, defaultAccount);

        // If your contract requires constructor args, you can specify them here
        const contract = await factory.deploy();
        

        await interaction.editReply(`The contract was deployed at ${contract.address}`)
    },
};