const {getGames} = require("../blaseball-api/game");
const { getTeam } = require("../util/teamUtils");
const { MessageEmbed } = require("discord.js");
const { Weather } = require("../util/gameUtils");

const command = {
    name: "game",
    aliases: [],
    description: "Lookup a game by season, day, and team!\nbb!game [season] [day] [team]\n*Postseason is day 100 of the previous season*",
    async execute(message, args) {
        if(args < 3) return message.send("You must specify a season, day, and team!");
        let season = args.shift()-1;
        let day = args.shift()-1;
        let teamName = args.join(" ");
        let team = await getTeam(teamName);
        if(!team) return message.channel.send("I can't find that team!");
        let games = await getGames(season,day);
        let game = games.filter(g=> (g.awayTeam == team.id || g.homeTeam == team.id))[0];
        if(!game) return message.channel.send("That game doesn't exist!");
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
            .addField("Loser Shamed?",game.shame?"Yes":"No",true)
            ;
            

        message.channel.send(gameCard);
    },
};

module.exports = command;

//https://www.blaseball.com/database/games?season=3&day=68