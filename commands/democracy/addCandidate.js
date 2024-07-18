const { SlashCommandBuilder } = require('discord.js');
const { ethers } = require('ethers');
require('dotenv').config();

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_ENDPOINT);
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add_candidate')
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

        // added this block inside the execute function because I don't want it to execute if the command hasn't been run
        const contractData = JSON.parse(fs.readFileSync("../contracts/build/ballot.json"));
        const contract = new ethers.Contract(contractAddress, contractData.abi, wallet); 

        const electionID = interaction.options.getInteger('electionid');
        const username = interaction.options.getString('username');
        const role = interaction.options.getString('role');

        try {
            const tx = await contract.addCandidate(electionID, username, role);
            await tx.wait();
            // listen for event in events/candidateAdded.js
            await interaction.reply(`Candidate ${username} added to election ${electionID} for role ${role}.`);
        } catch (error) {
            console.error(error);
            await interaction.reply('Error adding candidate.');
        }
    },
};