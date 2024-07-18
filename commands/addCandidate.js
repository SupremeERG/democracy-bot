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
        .setName('addCandidate')
        .setDescription('Adds a candidate to an election.')
        .addIntegerOption(option =>
            option.setName('electionid')
                .setDescription('The ID of the election')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The username of the candidate')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('role')
                .setDescription('The role the candidate is campaigning for')
                .setRequired(true)),
    async execute(interaction) {
        const electionID = interaction.options.getInteger('electionid');
        const username = interaction.options.getString('username');
        const role = interaction.options.getString('role');

        try {
            const tx = await contract.addCandidate(electionID, username, role);
            await tx.wait();
            await interaction.reply(`Candidate ${username} added to election ${electionID} for role ${role}.`);
        } catch (error) {
            console.error(error);
            await interaction.reply('Error adding candidate.');
        }
    },
};
