
const fetch = require("node-fetch");
const client = global.client;

async function getPlayers(players){
    return await fetch(client.config.apiUrl+"/players?ids="+players.join(","))
        .then(res => {
            if(!res.ok) throw new Error(res.statusText);
            return res.json();
        })
        .catch(e => console.error("Error at endpoint /players:",e.message));
}


module.exports = {
    getPlayers: getPlayers
};