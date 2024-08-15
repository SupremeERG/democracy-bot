const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
    cooldown: 60,
    data: new SlashCommandBuilder()
        .setName('ballot')
        .setDescription('Shows the ballot for an election')
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


        try {
            let election = await contract.getElection(electionID);

            election = {
                id: electionID._hex,
                active: election[0].active,
                guildID: `${election[0].guildID}`,
                initiator: `${election[0].initiator}`,
                role: `${election[0].role}`,
                voters: election[1],
                candidates: election[2]
            };

            let candidates = function () {
                let candidateList = []
                election.candidates.forEach(candidate => {
                    candidateList.push(String(candidate.user))
                })
                return candidateList
            }()
            
            const embed = new EmbedBuilder()
            .setTitle("Election Ballot")
            .setDescription("Position: " + `<@&${election.role}>`)
            .setFooter({text:"This ballot may be updated at any time so check again to see new candidates"})
            .setColor("Aqua")
            candidates.forEach((candidate) => {
                embed.setFields({name: `Candidate`, value: `<@${candidate}>`, inline: true})
            })

            interaction.channel.send({embeds: [embed]})
        } catch (error) {
            console.error(error)
            //let parsedError = contract.interface.parseError(error.error.error.error.data.data);
            //if (parsedError.name == "InvalidElectionID") return await interaction.editReply("You entered an invalid election ID. Please make sure you entered the electionID of an active election.")
            await interaction.editReply('Error fetching ballot.');
        }
    },
};