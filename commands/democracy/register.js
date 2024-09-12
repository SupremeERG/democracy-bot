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
        .setName('register')
        .setDescription('Register as a voter (required to vote)')
        .addStringOption(option =>
            option.setName('electionid')
                .setDescription('The ID of the election you would like to register for')
                .setRequired(true)),
    async execute(client, interaction) {
        await interaction.deferReply({ ephemral: true });

        const electionID = interaction.options.getString("electionid");
        const user = interaction.user.id;

        try { 
            await contract.registerVoter(electionID, user);

            interaction.editReply("You are now registered as a valid voter");
            
        } catch (error) {
            console.log("ERROR REGISTERING VOTER");
            console.error(error);

            if (error.name == "VoterAlreadyExists") return interaction.editReply("You are already registered as a voter.")
            else return interaction.editReply("Error while registering as a voter")
        }
        /*
        await interaction.deferReply({ ephemeral: true });

        const initiator = interaction.user.id;
        let roleName = interaction.options.getString('role');
        const duration = interaction.options.getString('duration');

        if (isNaN(duration)) return interaction.editReply("You need to supply a number for `duration`.")

        let role = interaction.guild.roles.cache.find(guildRole => guildRole.name == roleName);
        if (!role) return interaction.editReply(`The role "${roleName}" could not be found. Try again with the correct role name.`);

        try {
            const tx = await contract.startElection(interaction.guildId, initiator, role.id, Math.floor(duration * 60 * 60));
            await tx.wait();

            interaction.editReply(`Election started.`);
        } catch (error) {
            console.error(error);
            await interaction.editReply('Error starting election.');
        }*/
    },
};
