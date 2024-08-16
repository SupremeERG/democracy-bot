// script for recompiling smart contract

const fs = require("fs");
const { exec } = require("child_process");

const contractLocation = "contracts/ballot.sol"
const outputLocation = "contracts/build/"
let contractJSON = JSON.parse(fs.readFileSync("contracts/build/ballot.json"))


exec(`solcjs --bin --abi -o ${outputLocation} ${contractLocation}`, (err, stdout, stderr) => {
    if (err) return console.error(err)
    console.log(stdout);

    let newContractABI = Buffer.from(fs.readFileSync(`${outputLocation}/contracts_ballot_sol_Ballot.abi`)).toString();
    let newContractBytecode = Buffer.from(fs.readFileSync(`${outputLocation}/contracts_ballot_sol_Ballot.bin`)).toString();

    contractJSON.abi = eval(newContractABI);
    contractJSON.bytecode = newContractBytecode;


    fs.writeFileSync("contracts/build/ballot.json", JSON.stringify(contractJSON))
})

