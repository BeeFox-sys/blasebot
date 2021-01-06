const { messageError } = require("../util/miscUtils");
const { MessageEmbed } = require("discord.js");
const { gameCache } = require("blaseball");

const command = {
    name: "results",
    aliases: ["scores"],
    description: "Returns the results for a day\nbb!results [season] [day]",
    root: false,
    async execute(message, args) {

        if(args.length < 2) return message.channel.send("You must specify a season and day").then(global.stats.messageFreq.mark()).catch(messageError);

        let games;
        games = await gameCache.fetchByDay(args[1]-1,args[0]-1);
        if(!(Object.values(games).every(game=>game.gameStart) === true) || games.length == 0) return message.channel.send("Day does not exist, or has yet to begin!").catch(messageError);
        let result = results(games);
        message.channel.send(result).then(global.stats.messageFreq.mark()).catch(messageError);
    },
};

function results(games){
    let results = new MessageEmbed()
        .setTitle(`Season ${games[0].season+1} Day ${games[0].day+1} ${(Object.values(games).every(game=>game.gameComplete) === true)?"Final Results:":"Live Scores:"}`);
    for(const game of games){
        let underlineHome = game.awayScore < game.homeScore;
        results.addField(`${Number(game.awayTeamEmoji)?String.fromCodePoint(game.awayTeamEmoji):game.awayTeamEmoji} v. ${Number(game.homeTeamEmoji)?String.fromCodePoint(game.homeTeamEmoji):game.homeTeamEmoji}`, `${!underlineHome&&game.gameComplete?"__":""}**${game.awayScore}**${!underlineHome&&game.gameComplete?"__":""} | ${underlineHome&&game.gameComplete?"__":""}**${game.homeScore}**${underlineHome&&game.gameComplete?"__":""}`,true);
    }
    return results;
}

module.exports = command;