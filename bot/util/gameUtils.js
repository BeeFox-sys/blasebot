const { MessageEmbed } = require("discord.js");


//PlayerCache


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
    12: "Feedback",
    13: "Reverb"
};

async function generateGameCard(game){
    let winner, loser;
    if(game.gameComplete){
        if(game.homeScore>game.awayScore) {
            winner = game.homeTeamNickname;
            loser = game.awayTeamNickname;
        }
        else {
            winner = game.awayTeamNickname;
            loser = game.homeTeamNickname;
        }
    } else if(game.gameStart) winner = "[*Game in progress*](https://www.blaseball.com/)";
    else winner = "[*Game yet to start*](https://www.blaseball.com/upcoming)";
    let gameCard = new MessageEmbed()
        .setTitle(`${String.fromCodePoint(game.awayTeamEmoji)} __${game.awayTeamName}__ vs __${game.homeTeamName}__ ${String.fromCodePoint(game.homeTeamEmoji)}\nSeason ${game.season+1} Day ${game.day+1}`)
        .setColor(game.homeTeamColor)
        .setFooter(`Season: ${game.season+1} | Day: ${game.day+1}`)
        .addField(`${game.awayTeamNickname} Odds`, Math.round(game.awayOdds*100)+"%",true)
        .addField(`${game.homeTeamNickname} Odds`, Math.round(game.homeOdds*100)+"%",true)
        .addField("Game",`${game.seriesIndex} of ${game.seriesLength}`,true)
        .addField(`${game.awayTeamNickname} Pitcher`,game.awayPitcherName||"Undecided", true)
        .addField(`${game.homeTeamNickname} Pitcher`,game.homePitcherName||"Undecided", true)
        .addField("Winner",winner,true)
        .addField(`${game.awayTeamNickname} Score`, game.awayScore, true)
        .addField(`${game.homeTeamNickname} Score`, game.homeScore, true)
        .addField("Inning", game.gameStart?`${game.topOfInning?"Top":"Bottom"} of inning ${game.inning+1}`:"*Game yet to start*")
        .addField("Weather", Weather[game.weather], true)
        .setFooter(`ID: ${game.id}`);

    if(game.shame) game.outcomes.push(`The ${loser} were shamed!`);

    if(game.outcomes.length) gameCard.addField("Events",game.outcomes.join("\n"));

    return gameCard;
}


module.exports = {
    generateGameCard: generateGameCard,
    Weather: Weather
};