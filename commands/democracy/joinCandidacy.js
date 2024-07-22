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
    cooldown: 15,
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
        if (isNaN(electionID)) return interaction.editReply("You must provide a number. ||The election ID starting in \"0x\" is a number.||")

        const user = interaction.user


        try {
            const tx = await contract.addCandidate(electionID, user.id);
            await tx.wait();

            await interaction.editReply(`Candidate <@${user.id}> added to election ${electionID}.`);
        } catch (err) {
            if (err.code == "UNPREDICTABLE_GAS_LIMIT") err = err.error
            const { error } = decodeError(err)
            console.log(error);
            if (error.name == "InvalidElectionID") return await interaction.editReply("You entered an invalid election ID. Please make sure you entered the electionID of an active election.")
            await interaction.editReply('Error adding candidate. Make sure you input a valid election ID.');

        }
    },
};