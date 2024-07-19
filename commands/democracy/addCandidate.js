const { SlashCommandBuilder } = require('discord.js');
const { ethers } = require('ethers');
require('dotenv').config();
const fs = require("fs");

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_ENDPOINT);
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);
const contractAddress = require("../../config.json").contractAddress;


module.exports = {
    enabled: true,
    data: new SlashCommandBuilder()
        .setName('add_candidate')
        .setDescription('Adds a candidate to an election.')
        .addStringOption(option =>
            option.setName('electionid')
                .setDescription('The ID of the election')
                .setRequired(true)),
    async execute(client, interaction) {

        // added this block inside the execute function because I don't want it to execute if the command hasn't been run
        const contractData = JSON.parse(fs.readFileSync("contracts/build/ballot.json"));
        const contract = new ethers.Contract(contractAddress, contractData.abi, wallet); 

        const electionID = interaction.options.getString('electionid');
        const user = interaction.user

        try {
            const tx = await contract.addCandidate(electionID, user.id);
            await tx.wait();
            // listen for event in events/candidateAdded.js
            await interaction.reply(`Candidate <@${user.id}> added to election ${electionID}.`);
        } catch (error) {
            console.error(error);
            await interaction.reply('Error adding candidate.');
        }
    },
};