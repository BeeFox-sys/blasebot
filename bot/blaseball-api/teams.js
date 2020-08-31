
const fetch = require("node-fetch");
const client = global.client;
const NodeCache = require("node-cache");
const { Collection } = require("discord.js");
const { performance } = require("perf_hooks");

async function getAllTeams(){
    return await fetch(client.config.apiUrl+"/allTeams")
        .then(res => {
            if(!res.ok) throw new Error(res.statusText);
            return res.json();
        })
        .catch(e => console.error("Error at endpoint /allTeams:",e.message));
}

const TeamNames = new Collection();
const TeamCache = new NodeCache();

setInterval(updateTeamCache, 30*60*1000);


async function updateTeamCache(){
    console.log("Caching teams...");
    if(client.mode == 3) return;
    let beginCache = performance.now();
    let res = await getAllTeams();
    if(!res) {
        client.mode = 1;
        setTimeout(updateTeamCache,2*60*1000);
        return console.warn("Couldn't get a response from blaseball! trying again in 2 minutes!");
    }
    for (let index = 0; index < res.length; index++) {
        const team = res[index];
        TeamCache.set(team.id, team);
        TeamNames.set(team.id, {
            lowercase: team.fullName.toLowerCase(),
            location: team.location.toLowerCase(),
            nickname: team.nickname.toLowerCase(),
            shorthand: team.shorthand.toLowerCase(),
            emoji: String.fromCodePoint(team.emoji)
        });
    }
    client.mode = 0;
    let endCache = performance.now();
    console.log(`Cached ${TeamCache.keys().length} Teams in ${Math.ceil(endCache-beginCache)}ms!`);
    return;
}

module.exports = {
    getAllTeams: getAllTeams,
    updateTeamCache: updateTeamCache,
    TeamCache: TeamCache,
    TeamNames: TeamNames
};