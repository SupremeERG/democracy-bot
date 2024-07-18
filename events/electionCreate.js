/* this component will listen for the electionInitiated -- or whatever its called -- event
when it runs, it should send a message to a dedicated channel saying an election starting
but I am still afraid there might be errors with the election object storage so I want to worry about
adding candidates tomorrow*/


const { ethers } = require("ethers");


module.exports = {
    name: "ElectionInitiated",
    type: "contract",
    async execute(client, electionID, guildID, initiator, duration, endTime) {
        // Having some troubles with this one :|
        /*
        let eID = electionID._hex;
        console.log(`election ${eID} creatd in ${guildID}`);

        const guild = client.guilds.fetch(guildID);
        console.log(guild.name)
        console.log(guild.channels)
        
        let electionChannel = guild.channels.cache.find((channel) => channel.name == "elections");

        electionChannel.send("New election: " + `${eID}\n${initiatior}\n${duration}\n${endTime}`)
        */
    }
}