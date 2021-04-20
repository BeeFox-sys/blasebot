// Const { interactionRespond } = require("../util/interactionUtils.js");
const {performance} = require("perf_hooks");

const fs = require("fs");
const {interactionThink} = require("../util/interactionUtils");

const commandLoadStart = performance.now();

const subcommands = {};
// eslint-disable-next-line max-len
const commandFiles = fs.readdirSync("./bot/commands/lookup/").filter((file) => file.endsWith(".js"));
let loadedCommands = 0;

for (const file of commandFiles) {

    const command = require(`./lookup/${file}`);

    subcommands[command.action] = command.execute;
    loadedCommands++;

}
const commandLoadEnd = performance.now();

// eslint-disable-next-line max-len
console.log(`Loaded ${loadedCommands} lookup subcommands in ${Math.ceil(commandLoadEnd - commandLoadStart)}ms!`);

const command = {
    "action": "lookup",
    async execute (interaction, client) {

        await interactionThink(interaction, client);
        subcommands[interaction.data.options[0].name](interaction, client);
    
    }
};

module.exports = command;
