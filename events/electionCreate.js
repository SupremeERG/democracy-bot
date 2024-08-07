const { Embed, EmbedBuilder } = require("discord.js");
const { ethers } = require("ethers");
const fs = require("fs");
require('dotenv').config();
const appConfig = require("../config.json")
const provider = new ethers.providers.JsonRpcProvider(appConfig.rpcEndpoint);
const privateKey = process.env.PRIVATE_KEY;


function calculateTime(time) {
    if (isNaN(time)) throw "Integer not given for \"time\" parameter";
    if (time / 60 < 1) return [time, "seconds"]
    else if (time / (60 * 60) < 1) return [Math.round(time / (60)), "minutes"]
    else if (time / (60 * 60 * 60) < 1) return [Math.round(time / (60 * 60)), "hours"]
    else if (time / (60 * 60 * 24) < 1) return [Math.round(time / (60 * 60 * 24)), "days"]
    else return [Math.round(time / (60 * 60 * 24 * 7)), "weeks"]
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


module.exports = {
    name: "ElectionInitiated",
    type: "contract",
    async execute(client, electionID, guildID, initiator, role, duration, endTime) {
        const wallet = new ethers.Wallet(privateKey, provider);
        const contractAddress = appConfig.contractAddress;
        const contractData = JSON.parse(fs.readFileSync("contracts/build/ballot.json"));
        const contract = new ethers.Contract(contractAddress, contractData.abi, wallet);


        let eID = electionID._hex// Converting BigInt to String also converts the number to regular number
        console.log(`election ${eID} created in ${guildID}`);

        const guild = client.guilds.cache.find(guild => guild.id == `${guildID}`);
        let electionChannel = guild.channels.cache.find((channel) => channel.name == "elections");

        let [calculatedDuration, timeUnit] = calculateTime(`${duration}`);

        // TODO: START AN ASYNCHRONOUS TIMER THAT WILL CALL THE endElection FUNCTINO ON END
        setTimeout(() => {
            contract.endElection(eID);
        }, (duration * 1000) + 5000); // add 5 seconds to compensate for network delay
        console.log("done")

        const embed = new EmbedBuilder()
            .setColor(getRandomColor())
            .setTitle("New Election")
            .setFields(
                { name: "Election ID", value: eID },
                { name: "Position", value: `<@&${role}>` },
                { name: "Started by", value: `<@${initiator}>` },
                { name: "Duration", value: `${calculatedDuration} ${timeUnit}`, inline: true },
                { name: "Ends", value: `<t:${endTime}>`, inline: true },
            )
            .setFooter({ text: "Join the candidacy with /join_candidacy or Vote with /vote" })

        electionChannel.send({ embeds: [embed] })
    }
}