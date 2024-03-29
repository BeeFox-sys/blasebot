/* eslint-disable no-sync */
console.log(`       ▞▚
      ▞  ▚
     ▞    ▚
     ▚    ▞
   ▞▚ ▚  ▞ \x1b[5m▟▙\x1b[0m
  ▞  ▚ ▚▞ \x1b[5m▟██▙\x1b[0m
 ▞    ▚  \x1b[5m▟████▙\x1b[0m
 ▚    ▞  \x1b[5m▜████▛\x1b[0m
  ▚  ▞    \x1b[5m▜██▛\x1b[0m
   ▚▞      \x1b[5m▜▛\x1b[0m  
\x1b[1mBlasebot Loading\x1b[0m`);
import * as fs from "fs";

const packagejson = JSON.parse(fs.readFileSync("./package.json"));

const vlength = packagejson.version.length;
const pad = (16 - vlength) / 2;

console.log(`${" ".repeat(Math.floor(pad))}v${packagejson.version}${" ".repeat(Math.ceil(pad))}\n`);

import Discord from "discord.js";
import dotenv from "dotenv";
// Setup Mongoose
import Mongoose from "mongoose";
import process, {exit} from "process";
import "./event_distribution/game_loop.mjs";

const client = new Discord.Client({
    "restGlobalRateLimit": 48,
    "intents": [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.DirectMessages
    ]
});

dotenv.config();


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
    client.presence.set({
        "status": "online",
        "activities": [
            {

                /*
                 * "name": `Blaseball! | ${revision}${
                 *     modified.split("\n").filter((str) => str !== "").length > 0
                 *         ? `+M${modified.split("\n").filter((str) => str !== "").length}`
                 *         : ""}`,
                 */
                "name": `Blaseball! | v${packagejson.version}`,
                "type": "WATCHING",
                "url": "https://www.blaseball.com"
            }
        ]
    });


});

import commands from "./commands/index.mjs";
import {assert} from "console";

client.on("interactionCreate", (interaction) => {

    if (interaction.isCommand()) {

        commands[interaction.commandName](interaction)
            .catch((error) => {

                console.error(error);
                console.error(interaction);
                if (!interaction.isAutocomplete()) {

                    interaction.followUp({
                        "ephemeral": true,
                        "content": "There was an error with this command, please report it!"
                    });
                
                }

            });

    }

});

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);


export {
    client
};
