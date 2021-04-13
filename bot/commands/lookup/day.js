// const { messageError } = require("../util/miscUtils");
const { MessageEmbed } = require("discord.js");
const { gameCache } = require("blaseball");
const { interactionThunk } = require("../../util/interactionUtils");
const { generateGameCard } = require("../../util/gameUtils");

const command = {
    action: "day",
    async execute(interaction, client) {

        let season = interaction.data.options[0].options[0].value;
        let day = interaction.data.options[0].options[1].value;
        let team = interaction.data.options[0].options[2]?.value ?? null;

        let games;
        games = await gameCache.fetchByDay(day-1,season-1);
        if(!(Object.values(games).every(game=>game.gameStart) === true) || games.length == 0) return interactionThunk(interaction, client, {content:"Day does not exist, or has yet to begin!"});
        if(team){
            let game = games.filter(g=> (g.awayTeam == team || g.homeTeam == team))[0];
            if(game) {
                let gameCard = await generateGameCard(game);
                return interactionThunk(interaction, client, {embeds:[gameCard]});
            }
        }
        let result = results(games);
        interactionThunk(interaction, client, {embeds:[result]});
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