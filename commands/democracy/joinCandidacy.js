const { SlashCommandBuilder } = require('discord.js');
const { ethers } = require('ethers');
require('dotenv').config();
const fs = require("fs");
const appConfig = require("../../config.json");

const provider = new ethers.providers.JsonRpcProvider(appConfig.rpcEndpoint);
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);
const contractAddress = appConfig.contractAddress;


module.exports = {
    enabled: true,
    data: new SlashCommandBuilder()
        .setName('join_candidacy')
        .setDescription('Adds a candidate to an election.')
        .addStringOption(option =>
            option.setName('electionid')
                .setDescription('The ID of the election')
                .setRequired(true)),
    async execute(client, interaction) {
        await interaction.deferReply();
        // added this block inside the execute function because I don't want it to execute if the command hasn't been run
        const contractData = JSON.parse(fs.readFileSync("contracts/build/ballot.json"));
        const contract = new ethers.Contract(contractAddress, contractData.abi, wallet); 

        const electionID = interaction.options.getString('electionid');
        const user = interaction.user


        try {
            const tx = await contract.addCandidate(electionID, user.id);
            await tx.wait();

            await interaction.editReply(`Candidate <@${user.id}> added to election ${electionID}.`);
        } catch (error) {
            let parsedError = contract.interface.parseError(error.error.error.error.data.data);
            if (parsedError.name == "InvalidElectionID") return await interaction.editReply("You entered an invalid election ID. Please make sure you entered the electionID of an active election.")
            await interaction.editReply('Error adding candidate.');
        }
    },
};