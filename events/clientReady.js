const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	type: "discord",
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};
