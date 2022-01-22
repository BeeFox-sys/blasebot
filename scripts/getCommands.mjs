import dotenv from "dotenv";
dotenv.config();
import {REST} from "@discordjs/rest";
import {Routes} from "discord-api-types/v9";

if (process.argv.slice(2).length === 0) {

    console.error("Guild id or 'Global' required");
    throw new Error(0);

}

const rest = new REST({"version": "9"}).setToken(process.env.discordToken);

(async () => {

    try {

        console.log(`Getting Application ${process.argv.slice(2)[0]} Commands Json`);
        rest.get(process.argv.slice(2)[0] === "Global"
            ? Routes.applicationCommands(process.env.clientID)
            : Routes.applicationGuildCommands(
                process.env.clientID,
                process.argv.slice(2)[0]
            )).then(console.log);
    
    } catch (error) {

        console.error(error);
    
    }
    
})();
