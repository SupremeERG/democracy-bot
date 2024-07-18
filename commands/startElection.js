const { SlashCommandBuilder } = require('discord.js');
const { ethers } = require('ethers');
require('dotenv').config();

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;
const abi = [
    // contract ABI
];
const contract = new ethers.Contract(contractAddress, abi, wallet);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('startElection')
        .setDescription('Starts a new election.')
        .addStringOption(option =>
            option.setName('initiator')
                .setDescription('The username of the election initiator')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('role')
                .setDescription('The role the election is for')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('The duration of the election in seconds')
                .setRequired(true)),
    async execute(interaction) {
        const initiator = interaction.options.getString('initiator');
        const role = interaction.options.getString('role');
        const duration = interaction.options.getInteger('duration');

        try {
            const tx = await contract.startElection(initiator, role, duration);
            await tx.wait();
            await interaction.reply(`Election started by ${initiator} for role ${role} with duration ${duration} seconds.`);
        } catch (error) {
            console.error(error);
            await interaction.reply('Error starting election.');
        }
    },
};
