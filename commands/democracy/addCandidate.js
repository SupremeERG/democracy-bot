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
        .setName('add_candidate')
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

        //let member = client.guilds.cache.get() // I have to fetch guild from election object

        let election = await contract.getElection(electionID);

        //if (election["guildID"]._hex == "0x00" && election["initiator"] == "" && election["role"] == "") return await interaction.editReply(`I could not find an election by the ID of ${electionID}`)

        try {
            const tx = await contract.addCandidate(electionID, user.id);
            await tx.wait();

            await interaction.editReply(`Candidate <@${user.id}> added to election ${electionID}.`);
        } catch (error) {
            console.error(error);
            await interaction.editReply('Error adding candidate.');
        }
    },
};