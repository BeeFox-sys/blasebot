import dotenv from "dotenv";
dotenv.config();
import {data as commandData} from "../bot/commands/index.mjs";

if (process.argv.slice(2).length === 0) {

    console.error("Guild id or 'Global' required");
    throw new Error(0);

}

const commandJson = commandData.map((command) => command.toJSON());

import {REST} from "@discordjs/rest";
import {Routes} from "discord-api-types/v9";

const rest = new REST({"version": "9"}).setToken(process.env.discordToken);


(async () => {

    try {

        console.log("Started refreshing application (/) commands.");

        await rest.put(
            process.argv.slice(2)[0] === "Global"
                ? Routes.applicationCommands(process.env.clientID)
                : Routes.applicationGuildCommands(process.env.clientID, process.argv.slice(2)[0]),
            {"body": commandJson}
        );

        console.log("Successfully reloaded application (/) commands.");
    
    } catch (error) {

        console.error(error);
    
    }

})();
