
const fetch = require("node-fetch");
const client = global.client;
const { performance } = require("perf_hooks");
const NodeCache = require("node-cache");
const { Collection } = require("discord.js");
const { TeamCache } = require("./teams");

async function getPlayers(players){
    return await fetch(client.config.apiUrl+"/players?ids="+players.join(","))
        .then(res => {
            if(!res.ok) throw new Error(res.statusText);
            return res.json();
        })
        .catch(e => {
            console.log(e.code);
            console.error("Error at endpoint /players:",e.message);
        });
}

async function getListOfPlayers(){
    return await fetch("https://api.sibr.dev/chronicler/v1/players/names")
        .then(res => {
            if(!res.ok) throw new Error(res.statusText);
            return res.json();
        })
        .catch(e => {
            console.log(e.code);
            console.error("Error at chronicler endpoint /players/names:",e.message);
        });
}

//PlayerCache
const PlayerNames = new Collection();
const PlayerTeams = new Collection();
const PlayerCache = new NodeCache();

setInterval(updatePlayerCache, 15*60*1000);

async function updatePlayerCache(){
    console.log("Caching Players...");
    let beginCache = performance.now();
    let teams = TeamCache.keys();
    if(!teams.length) {
        console.log("Team cache empty, trying again in 1 minute");
        return client.setTimeout(updatePlayerCache, 2000*60);
    }
    for (let index = 0; index < teams.length; index++) {
        const team = TeamCache.get(teams[index]);
        let teamIDs = team.lineup.concat( team.rotation, team.bullpen, team.bench );
        teamIDs.forEach(playerID => {
            PlayerTeams.set(playerID, team.id);
        });
    }
    
    let playerPromises = [];
    let playerIDs = Object.keys(await getListOfPlayers());
    let requests = 0;
    for (let index = 0; index < playerIDs.length; index += 120) {
        requests++;
        let endindex = Math.min(playerIDs.length, index + 120);
        let subsetIDs = playerIDs.slice(index, endindex);
        playerPromises.push(
            getPlayers(subsetIDs).then((players)=>{
                let playerObjects = players.map(p => {return {key: p.id, val: p};});
                PlayerCache.mset(playerObjects);
                players.forEach(player => {
                    PlayerNames.set(player.name.toLowerCase(), player.id);
                });
            })
        );
    }
    await Promise.all(playerPromises);
    let endCache = performance.now();
    console.log(`Cached ${PlayerCache.keys().length} players using ${requests} requests in ${Math.ceil(endCache-beginCache)}ms!`);

}

async function getPlayer(name){
    let player = PlayerCache.get(name);
    if(!player){
        let playerName = PlayerNames.get(name.toLowerCase());
        if(!playerName) return null;
        player = PlayerCache.get(playerName);
    }
    if(!player) return null;
    else return player;
}

module.exports = {
    getPlayer: getPlayer,
    PlayerCache: PlayerCache,
    PlayerTeams: PlayerTeams,
    PlayerNames: PlayerNames,
    updatePlayerCache: updatePlayerCache
};