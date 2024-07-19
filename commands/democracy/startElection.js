const { SlashCommandBuilder } = require('discord.js');
const { ethers } = require('ethers');
const fs = require("node:fs");
require('dotenv').config();

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_ENDPOINT);
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractData = JSON.parse(fs.readFileSync("contracts/build/ballot.json"))

const contract = new ethers.Contract(contractAddress, contractData.abi, wallet);

module.exports = {
    enabled: true,
    data: new SlashCommandBuilder()
        .setName('create_election')
        .setDescription('Starts a new election.')
        .addStringOption(option =>
            option.setName('role')
                .setDescription('The role the election is for')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('The duration of the election in seconds')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const initiator = interaction.user.id;
        let roleName = interaction.options.getString('role');
        const duration = interaction.options.getInteger('duration');

        let role = interaction.guild.roles.cache.find(guildRole => guildRole.name == roleName);
        if (!role) return interaction.editReply(`The role "${roleName}" could not be found. Try again with the correct role name.`);

        try {
            const tx = await contract.startElection(interaction.guildId, initiator, role.id, duration);
            await tx.wait();

            interaction.editReply(`Election started.`);
            await interaction.channel.send(`Election started by <@${initiator}> for role <#${role.id}> with duration ${duration} seconds.`);
        } catch (error) {
            console.error(error);
            await interaction.editReply('Error starting election.');
        }
    },
};
