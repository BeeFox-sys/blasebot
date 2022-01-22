import dotenv from "dotenv";
dotenv.config();
import {REST} from "@discordjs/rest";
import {Routes} from "discord-api-types/v9";

const permissions = [
    {
        "id": "933289605216755732",
        "permissions": [
            {
                "id": "178116262390398976",
                "type": "2",
                "permission": true
            }
        ]
    }
];


const rest = new REST({"version": "9"}).setToken(process.env.discordToken);

(async () => {

    try {

        console.log("Setting Application Global Permissions");
        rest.put(
            Routes.guildApplicationCommandsPermissions(process.env.clientID, "748911244236554402"),
            {"body": permissions}
        ).then(console.log);
    
    } catch (error) {

        console.error(error);
    
    }
    
})();
