
const fetch = require("node-fetch");
const client = global.client;
const { performance } = require("perf_hooks");
const debounce = require("lodash.debounce");
const NodeCache = require("node-cache");
const { Collection } = require("discord.js");
const { TeamCache } = require("./teams");

async function getPlayers(players){
    return await fetch(client.config.apiUrl+"/players?ids="+players.join(","))
        .then(res => {
            if(!res.ok) throw new Error(res.statusText);
            return res.json();
        })
        .catch(e => console.error("Error at endpoint /players:",e.message));
}


//PlayerCache
const PlayerNames = new Collection();
const PlayerTeams = new Collection();
const PlayerCache = new NodeCache({stdTTL:900,checkperiod:600});

let debouncedUpdate = debounce(updatePlayerCache, 5000, {leading: true, trailing:false});

PlayerCache.on("del", function (key, value){
    debouncedUpdate();
});

async function updatePlayerCache(){
    console.log("Caching Players...");
    let beginCache = performance.now();
    let teams = TeamCache.keys();
    if(!teams.length) {
        console.log("Team cache empty, trying again in 1 minute");
        return client.setTimeout(updatePlayerCache, 2000*60);
    }
    client.mode = 3;
    let playerPromises = [];
    for (let index = 0; index < teams.length; index++) {
        const team = TeamCache.get(teams[index]);
        if(!team) {
            console.log("Team cache empty, trying again in 2 seconds");
            return client.setTimeout(updatePlayerCache, 2000);
        }
        let playerIDs = team.lineup.concat(team.rotation, team.bullpen, team.bench);
        playerPromises.push(
            getPlayers(playerIDs).then((players)=>{
                let playerObjects = players.map(p => {return {key: p.id, val: p};});
                PlayerCache.mset(playerObjects);
                players.forEach(player => {
                    PlayerNames.set(player.name.toLowerCase(), player.id);
                    PlayerTeams.set(player.id, team.id);
                });
            })
        );
    }
    await Promise.all(playerPromises);
    let endCache = performance.now();
    client.mode = 0;
    console.log(`Cached ${PlayerCache.keys().length} players in ${Math.ceil(endCache-beginCache)}ms!`);

}

module.exports = {
    getPlayers: getPlayers,
    PlayerCache: PlayerCache,
    PlayerTeams: PlayerTeams,
    updatePlayerCache: updatePlayerCache
};