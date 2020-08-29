const NodeCache = require("node-cache");

//PlayerCache
const GameCache = new NodeCache({stdTTL:300,checkperiod:150});

function updateGameCache(value){
    GameCache.set("games",value.games);
    GameCache.set("leagues",value.leagues);
    GameCache.set("temporal",value.temporal);
}


module.exports = {
    updateGameCache: updateGameCache,
    GameCache: GameCache
};