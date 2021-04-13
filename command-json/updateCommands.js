const fetch = require("node-fetch");


if(process.argv[2]=="global"){
    process.argv[2] = null;
} else if(process.argv[2] == undefined) {
    console.log("Use either \"global\" or a guild ID as an argument to update commands");
    process.exit();
}

const fs = require("fs");
const commandFiles = fs.readdirSync("./command-json/").filter(file => file.endsWith(".json"));

const options = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Bot "+require("../config.json").discordToken
    }
};


(async ()=>{for (const file of commandFiles) {
    options.body = JSON.stringify(require(`./${file}`));
    await fetch("https://discord.com/api/v8/applications/"+require("../config.json").clientID+(process.argv[2]?"/guilds/"+process.argv[2]+"/commands":"/commands"), options ).then(res=>{console.log(res.status, file);});
    
}})();



