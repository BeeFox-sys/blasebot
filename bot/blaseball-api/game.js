
const fetch = require("node-fetch");
const client = global.client;
const NodeCache = require("node-cache");

const DataStreamCache = new NodeCache();
const GameCache = new NodeCache({stdTTL:300, checkperiod:30});
const DayCache = new NodeCache({stdTTL:300, checkperiod:30});

DayCache.on("expired",key=>console.debug("Expired day:",key));

async function getGames(season,day){
    let dayData = DayCache.get(`${season}:${day}`);
    if(dayData) return dayData;
    console.debug(`Caching day: ${season}:${day}`);
    return await fetch(client.config.apiUrl+"/games?season="+season+"&day="+day)
        .then(async res => {
            if(!res.ok) throw new Error(res.statusText);
            let dayData = await res.json();
            if(!dayData.length) return dayData;
            let currentDay = DataStreamCache.get("games").sim.day;
            let currentSeason = DataStreamCache.get("games").sim.season;
            let ttl;
            if(dayData[0].season == currentSeason 
                && dayData[0].day == currentDay) ttl = 60;
            else ttl = 600;
            DayCache.set(`${season}:${day}`, dayData, ttl);
            console.debug(`Cached day: ${season}:${day}`);
            return dayData;
        })
        .catch(e => console.error("Error at endpoint /games:",e.message));
}

function updateStreamData(value){
    // console.debug("Updating Stream Data");
    DataStreamCache.set("games",value.games);
    DataStreamCache.set("leagues",value.leagues);
    DataStreamCache.set("temporal",value.temporal);
}

GameCache.on("expired",key=>console.debug("Expired game:",key));


async function getGameByID(id){
    let game = GameCache.get(id);
    if(game) return game;
    console.debug(`Caching game: ${id}`);
    return await fetch(client.config.apiUrl+"/gameById/"+id)
        .then(async res => {
            if(res.status == 400) return null;
            if(!res.ok) throw new Error(res.statusText);
            let gameData = await res.json();
            let currentDay = DataStreamCache.get("games").sim.day;
            let currentSeason = DataStreamCache.get("games").sim.season;
            let ttl;
            if(gameData.season == currentSeason 
                && gameData.day == currentDay) ttl = 60;
            else ttl = 600;
            GameCache.set(id, gameData, ttl);
            console.debug(`Cached Game: ${gameData.id}`);
            return gameData;
        })
        .catch(e => console.error("Error at endpoint /gameByID:",e.message));
}

module.exports = {
    getGames: getGames,
    getGameByID: getGameByID,
    GameCache: DataStreamCache,
    updateStreamData: updateStreamData
};