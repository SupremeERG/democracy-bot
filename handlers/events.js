const path = require("node:path");
const fs = require("node:fs");

const eventsPath = path.join(__dirname, '../events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

module.exports = {
    listen: function (client, contract) {
        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);
            if (event.type == "contract") {
                if (event.once) {
                    // logic for one time event
                } else {
                    // logic for event listening
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