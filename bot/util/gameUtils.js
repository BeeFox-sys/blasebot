const NodeCache = require("node-cache");

//PlayerCache
const GameCache = new NodeCache({stdTTL:300,checkperiod:150});

function updateGameCache(value){
    GameCache.set("games",value.games);
    GameCache.set("leagues",value.leagues);
    GameCache.set("temporal",value.temporal);
}

const Weather = {
    0: "Void",
    1: "Sunny",
    2: "Overcast",
    3: "Rainy",
    4: "Sandstorm",
    5: "Snowy",
    6: "Acidic",
    7: "Eclipse",
    8: "Glitter",
    9: "Bloodwind",
    10: "Peanuts",
    11: "Bird",
    12: "Feedback"
};


module.exports = {
    updateGameCache: updateGameCache,
    GameCache: GameCache,
    Weather: Weather
};