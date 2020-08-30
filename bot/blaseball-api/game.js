
const fetch = require("node-fetch");
const client = global.client;
const NodeCache = require("node-cache");


async function getPlayoff(season){
    return await fetch(client.config.apiUrl+"/playoffs?number="+season)
        .then(res => {
            if(!res.ok) throw new Error(res.statusText);
            return res.json();
        })
        .catch(e => console.error("Error at endpoint /playoffs:",e.message));
}

async function getGames(season,day){
    return await fetch(client.config.apiUrl+"/games?season="+season+"&day="+day)
        .then(res => {
            if(!res.ok) throw new Error(res.statusText);
            return res.json();
        })
        .catch(e => console.error("Error at endpoint /playoffs:",e.message));
}

const GameCache = new NodeCache({stdTTL:300,checkperiod:150});

function updateGameCache(value){
    GameCache.set("games",value.games);
    GameCache.set("leagues",value.leagues);
    GameCache.set("temporal",value.temporal);
}

module.exports = {
    getPlayoff: getPlayoff,
    getGames: getGames,
    GameCache: GameCache,
    updateGameCache: updateGameCache
};