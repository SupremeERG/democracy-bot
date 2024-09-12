const fs = require("node:fs");
const contractData = JSON.parse(fs.readFileSync("../contracts/build/ballot.json"))
const web3 = new Web3("http://127.0.0.1:8545/");

console.log(contractData.abi)