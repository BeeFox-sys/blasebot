const fs = require("fs");
const Discord = require("discord.js");
const {performance} = require("perf_hooks");
const client = new Discord.Client({
    "restGlobalRateLimit": 45,
    "intents": [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.DIRECT_MESSAGES
    ]
});

require("dotenv").config();
client.mode = 0;
global.client = client;
// Const { messageError } = require("./util/miscUtils");

console.log("Loading commands...");
const commandLoadStart = performance.now();

client.commands = {};
const commandFiles = fs.readdirSync("./bot/commands").filter((file) => file.endsWith(".js"));
let loadedCommands = 0;

for (const file of commandFiles) {

    const command = require(`./commands/${file}`);

    client.commands[command.action] = command.execute;
    loadedCommands++;

}
const commandLoadEnd = performance.now();

// eslint-disable-next-line max-len
console.log(`Loaded ${loadedCommands} root commands in ${Math.ceil(commandLoadEnd - commandLoadStart)}ms!`);


require("./gameUpdates");

// Setup Mongoose
const Mongoose = require.main.require("mongoose");
const process = require("process");
const {exit} = require("process");
const {events} = require("blaseball");

events.on("ready", () => {

    console.log("Connected to blaseball");
    Mongoose.connect(process.env.DB_URL || process.env.dbUrl, {
        "useNewUrlParser": true,
        "useUnifiedTopology": true,
        "useFindAndModify": false,
        "useCreateIndex": true
    });

});
Mongoose.connection
    .on("error", (error) => {

        console.error(error);
        exit();

    })
    .once("open", () => {

        console.log("Connected to database");
        console.log("Connecting to discord...");
        client.login(process.env.discordToken).catch(console.err);
    
    });
// Client Ready
client.once("ready", () => {

    console.log(`Ready! Serving ${client.guilds.cache.size} blaseball communities!`);
    console.log("The commissioner is doing a great job");
    // Console.log(client.user);
    if (client.mode === 1) {

        client.user.setActivity("the waiting game | Can't connect to blaseball :c");
    
    } else {

        client.user.setActivity("Blaseball! | /info");
    
    }
    client.setInterval(() => {

        if (client.mode === 1) {
    
            client.user.setActivity("the waiting game | Can't connect to blaseball :c");
        
        } else {
    
            client.user.setActivity("Blaseball! | /info");
        
        }
    
    }, 300000);

});

client.on("message", (msg) => {

    if (msg.author.bot) {

        return;

    }
    if ((/.*love.*blasebot/iu).test(msg.cleanContent)) {

        msg.reply("❤ And I love you ❤");

    }

});

// Const {interactionThink}=require("./util/interactionUtils");
client.ws.on("INTERACTION_CREATE", async (interaction) => {

    /*
     *  Console.log(interaction.data.name);
     *  console.log(interaction);
     * transfer to correct command or handler
     *  interactionThink(interaction, client);
     */
    client.commands[interaction.data.name](interaction, client);

});


// Client.on("rateLimit", (err) => {

//     //console.error("ratelimit hit", err);

// });

client.on("error", console.error);
// Client.on("debug", console.debug);

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);
