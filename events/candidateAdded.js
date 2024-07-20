// Event triggers user is added to election in smart contract.
const { ethers } = require('ethers');
const fs = require("node:fs");
require('dotenv').config();
const appConfig = require("../config.json")
const provider = new ethers.providers.JsonRpcProvider(appConfig.rpcEndpoint);
const privateKey = process.env.PRIVATE_KEY;

function convert(hexValue) {
    return parseInt(hexValue, 16)
}

module.exports = {
    name: "CandidateAdded",
    type: "contract",
    async execute(client, electionID, candidateID) {

        const wallet = new ethers.Wallet(privateKey, provider);
        const contractAddress = appConfig.contractAddress;
        const contractData = JSON.parse(fs.readFileSync("contracts/build/ballot.json"));
        const contract = new ethers.Contract(contractAddress, contractData.abi, wallet);

        
        let election = await contract.elections(electionID);
        //let user = client.guilds.cache.get(`${election.guildID}`).members.cache.get(candidateID).user

        console.log(election)
        



    }
}