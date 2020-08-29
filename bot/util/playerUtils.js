const NodeCache = require("node-cache");
const {getPlayers} = require("../blaseball-api/players");
const {TeamCache} = require("./teamUtils.js");
const { Collection } = require("discord.js");
const { performance } = require("perf_hooks");
const debounce = require("lodash.debounce");
const client = global.client;

//PlayerCache
const PlayerNames = new Collection();
const PlayerTeams = new Collection();
const PlayerCache = new NodeCache({stdTTL:900,checkperiod:600});

let debouncedUpdate = debounce(updatePlayerCache, 5000, {leading: true, trailing:false});

TeamCache.on("del", function (key, value){
    debouncedUpdate();
});

async function updatePlayerCache(){
    console.log("Caching Players...");
    let beginCache = performance.now();
    let teams = TeamCache.keys();
    if(!teams.length) {
        client.mode = 1;
        setTimeout(updatePlayerCache,2*60*1000);
        return console.warn("Couldn't get a response from blaseball! trying again in 2 minutes!");
    }
    client.mode = 0;
    let playerPromises = [];
    for (let index = 0; index < teams.length; index++) {
        const team = TeamCache.get(teams[index]);
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
    console.log(`Cached ${PlayerCache.keys().length} players in ${Math.ceil(endCache-beginCache)}ms!`);

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
    updatePlayerCache: updatePlayerCache,
    playerCache: PlayerCache,
    PlayerTeams: PlayerTeams
};