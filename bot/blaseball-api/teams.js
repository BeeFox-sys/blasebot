
const fetch = require("node-fetch");
const client = global.client;

async function getAllTeams(){
    return await fetch(client.config.apiUrl+"/allTeams")
        .then(res => {
            if(!res.ok) throw new Error(res.statusText);
            return res.json();
        })
        .catch(e => console.error("Error at endpoint /allTeams:",e.message));
}

module.exports = {
    getAllTeams: getAllTeams
};