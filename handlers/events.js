const path = require("node:path");
const fs = require("node:fs");
const {ethers} = require("ethers");
const eventsPath = path.join(__dirname, '../events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
const appConfig = require("../config.json");

module.exports = {
    listen: async function (client, contract) {
        let startBlockNumber = await contract.provider.getBlockNumber();

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);
            if (event.type == "contract") {
                if (event.once) {
                    // logic for one time event
                    contract.once(event.name, (...args) => {
                        if (args[args.length - 1].blockNumber <= startBlockNumber) return; // stops the bot from executing on existing blockchain events

                        event.execute(client, ...args)
                    })
                } else {
                    // logic for event listening
                    contract.on(event.name, async (...args) => {
                        if (args[args.length - 1].blockNumber <= startBlockNumber) return; // stops the bot from executing on existing blockchain events

                        event.execute(client, ...args);
                    })

                }
            } else if (event.type == "discord") {
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(client, ...args));
                } else {
                    client.on(event.name, (...args) => event.execute(client, ...args));
                }
            } else {
                console.error("No event type was declared in " + filePath);
            }
        }
    },
    restartListener: async function (client, contract) {
        client.removeAllListeners();
        contract.removeAllListeners();

        const contractData = JSON.parse(fs.readFileSync("contracts/build/ballot.json"));
        const provider = new ethers.providers.JsonRpcProvider(appConfig.rpcEndpoint);
        const defaultAccount = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const freshContract = new ethers.Contract(appConfig.contractAddress, contractData.abi, defaultAccount)
        
        this.listen(client, freshContract);
        console.log("Listener restarted")
    }
}