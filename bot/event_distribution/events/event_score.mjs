import {send_teams} from "../send_events.mjs";
import {get_events, get_game} from "../../util/game.mjs";
import {emoji_string} from "../../util/team.mjs";


/**
 *
 * @param {JSON} event - Event object from feed
 */
export async function score_event (event) {

    let game = null;
    let siblings = [];
    const promises = [];


    if (event.metadata.siblingIds.length) {

        promises.push(get_events(event.metadata.siblingIds));

    }
    promises.push(get_game(event.gameTags[0]));

    await Promise.all(promises)
        .then((results) => {

            [
                siblings,
                game
            ] = results;
                    
        });
    
    // Was the team who scored the home team?
    let score_by_home = false;

    if (event.description.includes(game.homeTeamNickname)) {

        score_by_home = true;
    
    }

    // Compilate the plays into a message
    const plays = `>>> ${
        siblings
            .sort((first, second) => first.subplay - second.subplay)
            .map((sibling) => sibling.description)
            .join("\n")
    }\n\n\`${event.metadata.update}\``.trim();
    
    const score
        = `**${game.topOfInning ? "Top" : "Bottom"} of ${game.inning + 1}** | ${score_by_home
            ? (`${emoji_string(game.awayTeamEmoji)} ${event.metadata.awayScore} @ **${
                event.metadata.homeScore}** ${emoji_string(game.homeTeamEmoji)}`)

            : (`${emoji_string(game.awayTeamEmoji)} **${event.metadata.awayScore}** @ ${
                event.metadata.homeScore} ${emoji_string(game.homeTeamEmoji)}`)}`;
    

    send_teams([
        game.homeTeam,
        game.awayTeam
    ], {"sub_scores": true}, {
        "content": `${score}\n${plays}`
    });
    

}
