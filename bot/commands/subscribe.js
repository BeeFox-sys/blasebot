// const { interactionRespond } = require("../util/interactionUtils.js");
const { performance } = require("perf_hooks");

const fs = require("fs");

let commandLoadStart = performance.now();

let subcommands = {};
const commandFiles = fs.readdirSync("./bot/commands/subscribe/").filter(file => file.endsWith(".js"));
let loadedCommands = 0;

for (const file of commandFiles) {
    const command = require(`./subscribe/${file}`);
    subcommands[command.action] = command.execute;
    loadedCommands++;
}
let commandLoadEnd = performance.now();

console.log(`Loaded ${loadedCommands} subscribe subcommands in ${Math.ceil(commandLoadEnd-commandLoadStart)}ms!`);

const command = {
    action: "subscribe",
    async execute(interaction, client){
        subcommands[interaction.data.options[0].name](interaction, client);
    }
};

module.exports = command;