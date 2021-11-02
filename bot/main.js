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


require("./gameUpdates");

// Setup Mongoose
const Mongoose = require.main.require("mongoose");
const process = require("process");
const {exit} = require("process");
// Const {events} = require("blaseball");

Mongoose.connect(process.env.DB_URL || process.env.dbUrl, {
    "useNewUrlParser": true,
    "useUnifiedTopology": true,
    "useFindAndModify": false,
    "useCreateIndex": true
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

        client.user.setActivity("Short Circuts!");
    
    }
    client.timerloop = setInterval(() => {

        if (client.mode === 1) {
    
            client.user.setActivity("the waiting game | Can't connect to blaseball :c");
        
        } else {
    
            client.user.setActivity("Short Circuts!");
        
        }
    
    }, 300000);

});

// Const {interactionThink}=require("./util/interactionUtils");
client.on("interactionCreate", async (interaction) => {

    /*
     *  Console.log(interaction.data.name);
     *  console.log(interaction);
     * transfer to correct command or handler
     *  interactionThink(interaction, client);
     */
    interaction.reply({
        "content":
            "Blasebot is currently in life support mode, as such commands are avalible. functionality will return by the time the next full season occurs!\nIf you desperatly need updates to the subscriptions, please contact Beefox over in SIBR's blasebot channel!",
        "ephemeral": true
    });


});


// Client.on("rateLimit", (err) => {

//     //console.error("ratelimit hit", err);

// });

client.on("error", console.error);
// Client.on("debug", console.debug);

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);
