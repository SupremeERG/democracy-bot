const path = require("node:path");
const fs = require("node:fs");

const eventsPath = path.join(__dirname, '../events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

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

                        event.execute(client,...args);
                    })

                }
            } else if (event.type == "discord") {
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args));
                } else {
                    client.on(event.name, (...args) => event.execute(...args));
                }
            } else {
                console.error("No event type was declared in " + filePath);
            }
        }
    }
}