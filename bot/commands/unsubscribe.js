// Const { interactionRespond } = require("../util/interactionUtils.js");
const {performance} = require("perf_hooks");

const fs = require("fs");

const commandLoadStart = performance.now();

const subcommands = {};
const commandFiles
    = fs.readdirSync("./bot/commands/unsubscribe/").filter((file) => file.endsWith(".js"));
let loadedCommands = 0;

for (const file of commandFiles) {

    const command = require(`./unsubscribe/${file}`);

    subcommands[command.action] = command.execute;
    loadedCommands++;

}
const commandLoadEnd = performance.now();

// eslint-disable-next-line max-len
console.log(`Loaded ${loadedCommands} unsubscribe subcommands in ${Math.ceil(commandLoadEnd - commandLoadStart)}ms!`);

const command = {
    "action": "unsubscribe",
    async execute (interaction, client) {

        subcommands[interaction.data.options[0].name](interaction, client);
    
    }
};

module.exports = command;
