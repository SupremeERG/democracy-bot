// Event triggers user is added to election in smart contract.

module.exports = {
    name: "CandidateAdded",
    type: "contract",
    async execute(client, electionID, candidateID) {
        let member = client.guilds.cache.get() // I have to fetch guild from election object


        
    }
}