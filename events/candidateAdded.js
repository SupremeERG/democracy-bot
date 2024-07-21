// Event triggers user is added to election in smart contract.
// https://github.com/ethers-io/ethers.js/discussions/3027 << Error handling issue
const { ethers } = require('ethers');
const fs = require("node:fs");
require('dotenv').config();
const appConfig = require("../config.json")
const provider = new ethers.providers.JsonRpcProvider(appConfig.rpcEndpoint);
const privateKey = process.env.PRIVATE_KEY;

module.exports = {
    name: "CandidateAdded",
    type: "contract",
    async execute(client, electionID, candidateID) {

        const wallet = new ethers.Wallet(privateKey, provider);
        const contractAddress = appConfig.contractAddress;
        const contractData = JSON.parse(fs.readFileSync("contracts/build/ballot.json"));
        const contract = new ethers.Contract(contractAddress, contractData.abi, wallet);


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

        let user = client.guilds.cache.get(election.guildID).members.cache.get(`${candidateID}`).user;



    }
}