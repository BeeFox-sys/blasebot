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
    9: "Blooddrain",
    10: "Peanuts",
    11: "Bird",
    12: "Feedback",
    13: "Reverb"
};

async function generateGameCard(gameInput){
    let game = {...gameInput};
    let winner;
    if(game.gameComplete){
        winner = game.homeScore>game.awayScore ? game.homeTeamNickname : game.awayTeamNickname;
    } else if(game.gameStart) winner = "[*Game in progress*](https://www.blaseball.com/)";
    else winner = "[*Game yet to start*](https://www.blaseball.com/upcoming)";
    let shame = `SH${"A".repeat((Math.random()*5)+1)}${"M".repeat((Math.random()*5)+1)}${"E".repeat((Math.random()*5)+1)}${"!".repeat((Math.random()*5)+1)}`;
    let gameCard = new MessageEmbed()
        .setTitle(`${Number(game.awayTeamEmoji)?String.fromCodePoint(game.awayTeamEmoji):game.awayTeamEmoji} __${game.awayTeamName}__ vs __${game.homeTeamName}__ ${Number(game.homeTeamEmoji)?String.fromCodePoint(game.homeTeamEmoji):game.homeTeamEmoji}\nSeason ${game.season+1} Day ${game.day+1}`)
        .setColor(game.homeTeamColor)
        .setFooter(`Season: ${game.season+1} | Day: ${game.day+1}${game.shame?"\n"+shame:""}\nID: ${game.id}`)
        .addField(`${game.awayTeamNickname} Odds`, Math.round(game.awayOdds*100)+"%",true)
        .addField(`${game.homeTeamNickname} Odds`, Math.round(game.homeOdds*100)+"%",true)
        .addField("Game",`${game.seriesIndex} of ${game.seriesLength}`,true)
        .addField(`${game.awayTeamNickname} Pitcher`,game.awayPitcherName||"Undecided", true)
        .addField(`${game.homeTeamNickname} Pitcher`,game.homePitcherName||"Undecided", true)
        .addField("Winner",winner,true)
        .addField(`${game.awayTeamNickname} Score`, game.awayScore, true)
        .addField(`${game.homeTeamNickname} Score`, game.homeScore, true)
        .addField("Inning", game.gameStart?`${game.topOfInning?"Top":"Bottom"} of inning ${game.inning+1}`:"*Game yet to start*")
        .addField("Weather", Weather[game.weather]??"Uhhhh...", true);

    if(game.shame)game.outcomes.push(`The ${game.homeScore>game.awayScore?game.awayTeamNickname:game.homeTeamNickname} were shamed!`);

    if(game.outcomes.length) gameCard.addField("Events",game.outcomes.join("\n"));

    return gameCard;
}


module.exports = {
    generateGameCard: generateGameCard,
    Weather: Weather
};