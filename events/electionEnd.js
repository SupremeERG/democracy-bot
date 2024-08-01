const { Embed, EmbedBuilder } = require("discord.js");

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
    name: "ElectionEnded",
    type: "contract",
    async execute(client, electionID, winner, role, duration) {

        let eID = electionID._hex// Converting BigInt to String also converts the number to regular number
        console.log(`election ${eID} ended`);

		/*
        const guild = client.guilds.cache.find(guild => guild.id == `${guildID}`);
        let electionChannel = guild.channels.cache.find((channel) => channel.name == "elections");

        let [calculatedDuration, timeUnit] = calculateTime(`${duration}`);

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
            .setFooter({ text: "Join the candidacy with /join_candidacy or Vote with /vote"})

        electionChannel.send({ embeds: [embed] })*/
    }
}