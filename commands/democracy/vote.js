// Register as voter
const { SlashCommandBuilder } = require('discord.js');
const { ethers } = require('ethers');
const fs = require("node:fs");
require('dotenv').config();
const appConfig = require("../../config.json")
const provider = new ethers.providers.JsonRpcProvider(appConfig.rpcEndpoint);
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);
const contractAddress = appConfig.contractAddress;
const contractData = JSON.parse(fs.readFileSync("contracts/build/ballot.json"))

const contract = new ethers.Contract(contractAddress, contractData.abi, wallet);

module.exports = {
    enabled: true,
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Vote for a candidate')
        .addStringOption(option =>
            option.setName('electionid')
                .setDescription('The ID of the election you would like to vote for')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('candidate')
            .setDescription('The candidate you would like to vote for')
            .setRequired(true)),
    async execute(client, interaction) {
        await interaction.deferReply({ ephemral: true });

        const electionID = interaction.options.getString("electionid");
        const pickedCandidate = interaction.options.getString("candidate").slice(2, -1);
        const user = interaction.user.id;

        try { 
            await contract.vote(electionID, user, pickedCandidate)

            interaction.editReply("You are now registered as a valid voter");
            
        } catch (error) {
            console.log("ERROR VOTING");
            console.error(error);

            if (error.name == "VoterNotRegistered") return interaction.editReply("You are not registered as a voter. Reguister with /register")
            else return interaction.editReply("Error voting. Your vote was not counted.")
        }
    },
};
