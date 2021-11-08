import {readdir} from "fs/promises";
import Discord from "discord.js";
import {performance} from "perf_hooks";
const client = new Discord.Client({
    "restGlobalRateLimit": 45,
    "intents": [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.DIRECT_MESSAGES
    ]
});

import dotenv from "dotenv";
dotenv.config();
client.mode = 0;
global.client = client;


(async () => {

    console.log("Loading commands...");
    const commandLoadStart = performance.now();

    client.commands = {};
    const commandFiles = await readdir("./bot/commands")
        .then((res) => res.filter((file) => file.endsWith(".mjs")));
    let loadedCommands = 0;
    

    for (const file of commandFiles) {

        const command = await import(`./commands/${file}`);

        client.commands[command.action] = command.execute;
        loadedCommands++;

    }
    const commandLoadEnd = performance.now();

    console.log(`Loaded ${loadedCommands} root commands in ${Math.ceil(commandLoadEnd - commandLoadStart)}ms!`);

})();

// eslint-disable-next-line max-len


import "./gameUpdates.mjs";

// Setup Mongoose
import Mongoose from "mongoose";
import process, {exit} from "process";
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

client.on("ready", () => {

    console.log("ready");

});

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);
