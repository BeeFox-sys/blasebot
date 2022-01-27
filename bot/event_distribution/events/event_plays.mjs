import {send_teams} from "../send_events.mjs";
import {get_events, get_game, event_flags} from "../../util/game.mjs";
import {emoji_string} from "../../util/team.mjs";
import {event_sorting} from "../event_distributor.mjs";


export const eventList = [
    event_flags.STRIKEOUT,
    event_flags.FLYOUT,
    event_flags.STOLEN_BASE,
    event_flags.WALK,
    event_flags.HIT,
    event_flags.HALF_INNING
];


/**
 *
 * @param {JSON} event - Event object from feed
 */
export async function eventFunction (event) {
    

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

    if (siblings.some((sib) => sib.type === event_flags.RUNS_SCORED)) {

        return;
    
    }

    if (!game) {

        return;

    }

    // Compilate the plays into a message
    const plays = `>>> ${
        siblings
            .sort((first, second) => first.subplay - second.subplay)
            .map((sibling) => sibling.description)
            .join("\n")
    }`.trim();
    
    const score
        = `**${game.topOfInning ? "Top" : "Bottom"} of ${game.inning + 1}** | ${emoji_string(game.awayTeamEmoji)} ${game.awayScore} @ ${
            game.homeScore} ${emoji_string(game.homeTeamEmoji)}`;
    

    send_teams([
        game.homeTeam,
        game.awayTeam
    ], {"sub_plays": true}, {
        "content": `${score}\n${plays}`
    });
    

}
