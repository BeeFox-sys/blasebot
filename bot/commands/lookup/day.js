// Const { messageError } = require("../util/miscUtils");
const {MessageEmbed} = require("discord.js");
const {gameCache} = require("blaseball");
const {interactionThunk} = require("../../util/interactionUtils");
const {generateGameCard} = require("../../util/gameUtils");

const command = {
    "action": "day",
    async execute (interaction, client) {

        const season = interaction.data.options[0].options[0].value;
        const day = interaction.data.options[0].options[1].value;
        const team = interaction.data.options[0].options[2]?.value ?? null;

        const games = await gameCache.fetchByDay(day - 1, season - 1);

        if (!(Object.values(games).every((game) => game.gameStart) === true)
            || games.length === 0) {
 
            interactionThunk(
                interaction, client,
                {"content": "Day does not exist, or has yet to begin!"}
            );
            
            return;

        }
        if (team) {

            const [game] = games.filter((currentGame) => currentGame.awayTeam === team
            || currentGame.homeTeam === team);

            if (game) {

                const gameCard = await generateGameCard(game);

                
                interactionThunk(interaction, client, {"embeds": [gameCard]});
                
                return;
            
            }
        
        }
        const result = results(games);

        interactionThunk(interaction, client, {"embeds": [result]});
    
    }
};

/**
 * Game Results
 * @param {json} games
 * @returns {embed}
 */
function results (games) {

    const resultEmbed = new MessageEmbed()
        .setTitle(`Season ${games[0].season + 1} Day ${games[0].day + 1} ${
            Object.values(games)
                .every((game) => game.gameComplete) === true
                ? "Final Results:"
                : "Live Scores:"
        }`);

    for (const game of games) {

        const underlineHome = game.awayScore < game.homeScore;

        resultEmbed.addField(`${
            Number(game.awayTeamEmoji)
                ? String.fromCodePoint(game.awayTeamEmoji)
                : game.awayTeamEmoji
        } v. ${
            Number(game.homeTeamEmoji)
                ? String.fromCodePoint(game.homeTeamEmoji)
                : game.homeTeamEmoji
        }`, `${
            !underlineHome && game.gameComplete ? "__" : ""
        }**${
            game.awayScore
        }**${
            !underlineHome && game.gameComplete ? "__" : ""
        } | ${
            underlineHome && game.gameComplete ? "__" : ""
        }**${
            game.homeScore
        }**${
            underlineHome && game.gameComplete ? "__" : ""
        }`, true);
    
    }
    
    return resultEmbed;

}

module.exports = command;
