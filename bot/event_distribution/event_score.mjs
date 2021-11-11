import {get_game, get_events} from "../util/game.mjs";
import {get_team, emoji_string} from "../util/team.mjs";
import {model as team_subscription} from "../../schemas/team_subscription.mjs";
import {client} from "../main.mjs";
import {Permissions} from "discord.js";

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

    /*
     * console.debug(`${score_by_home
     *     ? (`${game.awayTeamNickname} @ \x1b[32m${game.homeTeamNickname}\x1b[0m`)
     *     : (`\x1b[32m${game.awayTeamNickname}\x1b[0m @ ${game.homeTeamNickname}`)}\n${
     *     siblings
     *         .sort((first, second) => first.subplay - second.subplay)
     *         .map((sibling) => sibling.description)
     *         .join("\n")
     * }\n\x1b[33m${event.metadata.update}\x1b[0m`);
     */


    // Compilate the plays into a message
    const plays = `>>> ${
        siblings
            .sort((first, second) => first.subplay - second.subplay)
            .map((sibling) => sibling.description)
            .join("\n")
    }\n\n\`${event.metadata.update}\``.trim();
    
    const score = `**${game.topOfInning ? "Top" : "Bottom"} of ${game.inning}** | ${score_by_home
        ? (`${emoji_string(game.awayTeamEmoji)} ${event.metadata.awayScore} @ **${
            event.metadata.homeScore}** ${emoji_string(game.homeTeamEmoji)}`)

        : (`${emoji_string(game.awayTeamEmoji)} **${event.metadata.awayScore}** @ ${
            event.metadata.homeScore} ${emoji_string(game.homeTeamEmoji)}`)}`;
    

    // Find all subscriptions with the relevant teams
    const subs = await team_subscription.find({"$or": [
        {"team_id": game.awayTeam,
            "sub_scores": true},
        {"team_id": game.homeTeam,
            "sub_scores": true}
    ]}).exec();

    // Each subscription document, this uses forEach because at this point nothing needs wait on anything else that cannot be done with .then
    subs.forEach((sub) => {

        // get channel
        client.channels.fetch(sub.channel_id)
            .then((channel) => {

                // Can view channel?
                if (!channel.viewable) {

                    return;

                }
                // Can send messages?
                if (channel.guild && !channel.permissionsFor(channel.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) {

                    return;

                }
                // Send it on!
                channel.send(`${score}\n${plays}`)
                    .catch((error) => {

                        switch (error.code) {

                        case 10003:
                            sub.delete();
                            break;
                        default:
                            console.error(error);
                        
                        }
                    
                    });

            })
            .catch((error) => {

                switch (error.code) {

                case 10003:
                    sub.delete();
                    break;
                default:
                    console.error(error);
                
                }
            
            });
    
    });

}
