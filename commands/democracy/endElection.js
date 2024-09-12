const { SlashCommandBuilder } = require('discord.js');
const { ethers } = require('ethers');
const { decodeError } = require('ethers-decode-error')
require('dotenv').config();
const fs = require("fs");
const appConfig = require("../../config.json");

const provider = new ethers.providers.JsonRpcProvider(appConfig.rpcEndpoint);
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);
const contractAddress = appConfig.contractAddress;


module.exports = {
    enabled: true,
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('end_election')
        .setDescription('Ends an election prematurely')
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
        if (isNaN(electionID)) return interaction.editReply("You must provide a number. ||The election ID starting in \"0x\" is a number.||")

        //const user = interaction.user

        try {
            await contract.endElection(electionID);

            await interaction.editReply("Election ended. Results should be announced now.");
        } catch (err) {
            await interaction.editReply("There was an error ending the election.");

            console.error(err);
        }
    },
};