const NodeCache = require("node-cache");
const { MessageEmbed } = require("discord.js");


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

async function generateGameCard(game){
    let winner = "";
    if(game.gameComplete){
        if(game.homeScore>game.awayScore) winner = game.homeTeamNickname;
        else winner = game.awayTeamNickname;
    } else if(game.gameStart) winner = "[*Game in progress*](https://www.blaseball.com/)";
    else winner = "[*Game yet to start*](https://www.blaseball.com/upcoming)";
    let gameCard = new MessageEmbed()
        .setTitle(`${String.fromCodePoint(game.homeTeamEmoji)} __${game.homeTeamName}__ vs __${game.awayTeamName}__ ${String.fromCodePoint(game.awayTeamEmoji)}`)
        .setColor(game.homeTeamColor)
        .setFooter(`Season: ${game.season+1} | Day: ${game.day+1}`)
        .addField(`${game.homeTeamNickname} Odds`, Math.floor(game.homeOdds*100)+"%",true)
        .addField(`${game.awayTeamNickname} Odds`, Math.floor(game.awayOdds*100)+"%",true)
        .addField("Winner",winner)
        .addField(`${game.homeTeamNickname} Score`, game.homeScore, true)
        .addField(`${game.awayTeamNickname} Score`, game.awayScore, true)
        .addField("Inning", game.gameStart?`${game.topOfInning?"Top":"Bottom"} of inning ${game.inning}`:"*Game yet to start*")
        .addField("Weather", Weather[game.weather], true)
        .addField("Loser Shamed?",game.shame?"Yes":"No",true);
    return gameCard;
}


module.exports = {
    updateGameCache: updateGameCache,
    generateGameCard: generateGameCard,
    GameCache: GameCache,
    Weather: Weather
};