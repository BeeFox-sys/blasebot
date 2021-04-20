const fetch = require("node-fetch");

// const fs = require("fs");
// const commandFiles = fs.readdirSync("./command-json/").filter(file => file.endsWith(".json"));

if(process.argv[2]=="global"){
    process.argv[2] = null;
} else if(process.argv[2] == undefined) {
    console.log("Use either \"global\" or a guild ID as an argument to delete commands");
    process.exit();
}

const options = {
    method: "get",
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Bot "+require("../config.json").discordToken
    }
};


(async ()=>{
    let ids = return await fetch("https://discord.com/api/v8/applications/"+require("../config.json").clientID+(process.argv[2]?"/guilds/"+process.argv[2]:"")+"/commands", options ).then(res=>res.json()).then(res=>res.map(c=>c.id));
    options.method = "delete";
    ids.forEach(id => {
        fetch("https://discord.com/api/v8/applications/"+require("../config.json").clientID+(process.argv[2]?"/guilds/"+process.argv[2]:"")+"/commands/"+id, options).then(res=>console.log(res.status, id));
    });
})(); 



