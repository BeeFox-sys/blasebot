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

import Discord from "discord.js";
import dotenv from "dotenv";
// Setup Mongoose
import Mongoose from "mongoose";
import process, {exit} from "process";
import "./event_distribution/game_loop.mjs";

const client = new Discord.Client({
    "restGlobalRateLimit": 48,
    "intents": [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.DIRECT_MESSAGES
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

});

import commands from "./commands/index.mjs";

client.on("interactionCreate", (interaction) => {

    if (interaction.isCommand()) {

        commands[interaction.commandName](interaction);

    }

});

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);


export {
    client
};
