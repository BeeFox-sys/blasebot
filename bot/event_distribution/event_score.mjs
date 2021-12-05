import {get_game, get_events} from "../util/game.mjs";
import {get_team, emoji_string} from "../util/team.mjs";
import {model as team_subscription} from "../../schemas/team_subscription.mjs";
import {client} from "../main.mjs";
import {Permissions} from "discord.js";

const TrueTeam = {
    "fab9420f-0730-4054-bd17-355113f204c2": "c73b705c-40ad-4633-a6ed-d357ee2e2bcf", // Lift
    "6f9ff34d-825f-477b-8600-1cec4febaecf": "a37f9158-7f82-46bc-908c-c9e2dda7c33b", // Jazz Hands
    "045b4b38-fb11-4fa6-8dc0-f75997eacd28": "ca3f1c8c-c025-4d8e-8eef-5be6accbeb16", // Firefighters
    "5371833b-a620-4952-b2cb-a15eed8ad183": "747b8e4a-7e50-4638-a973-ea7950a3e739", // Tigers
    "9da5c6b8-ccad-4bb5-b6b8-dc1d6b8ca6ed": "57ec08cc-0411-4643-b304-0e80dbc15ac7", // Wild Wings
    "7dc37924-0bb8-4e40-a826-c497d51e447c": "d9f89a8a-c563-493e-9d64-78e4f9a55d4a", // Georgias*

    "ee722cbd-812f-4525-81d7-dfa89fb867a4": "878c1bf6-0d21-4659-bfee-916c8314d69c", // Tacos
    "8b38afb3-2e20-4e73-bb00-22bab14e3cda": "b63be8c2-576a-4d6e-8daf-814f8bcea96f", // Dale
    "30c9bcd2-cc5a-421d-97d0-d39fefad053a": "3f8bbb15-61c0-4e3f-8e4a-907a5fb1565e", // Flowers
    "79347640-8d5d-4e41-819d-2b0c86f20b76": "f02aeae2-5e6a-4098-9842-02d2273f25c7", // Sunbeams
    "0706f3cf-d6c4-4bd0-ac8c-de3d75ffa77e": "9debc64f-74b7-4ae1-a4d6-fce0144b6ea5", // Spies
    "3a4412d6-5404-4801-bf06-81cb7884fae4": "bb4a9de5-c924-4923-a0cb-9d1445f1ee5d", // Worms

    "a94de6ef-5fc9-4470-89a0-557072fe4daf": "36569151-a2fb-43c1-9df7-2df512424c82", // Millennials
    "93f91157-f628-4c9a-a392-d2b1dbd79ac5": "b024e975-1c4a-4575-8936-a3754a08806a", // Steaks
    "36f4efea-9d27-4457-a7b4-4b45ad2e23a3": "b72f3061-f573-40d7-832a-5ad475bd7909", // Lovers
    "9a2f6bb9-c72c-437c-a3c4-e076dc5d10d4": "23e4cbc1-e9cd-47fa-a35b-bfa06f726cb7", // Pies
    "f0ec8435-0427-4ffd-ad0c-a67f60a75e0e": "105bc3ff-1320-4e37-8ef0-8d595cb95dd0", // Garages
    "19f81c84-9a94-49fa-9c23-2e1355126250": "46358869-dce9-4a01-bfba-ac24fc56f57e", // Mechanics

    "3d858bda-dcef-4d05-928e-6557d3123f17": "979aee4a-6d80-4863-bf1c-ee1a78e06024", // Hawai'i Fridays
    "505ae98b-7d85-4f51-99ef-60ccd7365d97": "eb67ae5e-c4bf-46ca-bbbc-425cd34182ff", // Moist Talkers
    "b1a50aa9-c515-46e8-8db9-d5378840362c": "bfd38797-8404-4b38-8b82-341da28b1f83", // Shoe Thieves
    "5818fb9b-f191-462e-9085-6fe311aaaf70": "7966eb04-efcc-499b-8f03-d13916330531", // Magic
    "d2949bd0-6a28-4e0d-aa07-cecc437cbd99": "adc5b394-8f76-416d-9ce9-813706877b84", // Breath Mints
    "22d8a1e9-e679-4bde-ae8a-318cb591d1c8": "8d87c468-699a-47a8-b40d-cfb73a5660ad" // Crabs
};

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
    
    const score = `**${game.topOfInning ? "Top" : "Bottom"} of ${game.inning + 1}** | ${score_by_home
        ? (`${emoji_string(game.awayTeamEmoji)} ${event.metadata.awayScore} @ **${
            event.metadata.homeScore}** ${emoji_string(game.homeTeamEmoji)}`)

        : (`${emoji_string(game.awayTeamEmoji)} **${event.metadata.awayScore}** @ ${
            event.metadata.homeScore} ${emoji_string(game.homeTeamEmoji)}`)}`;
    

    // Find all subscriptions with the relevant teams
    const subs = await team_subscription.find({"$or": [
        {"team_id": TrueTeam[game.awayTeam],
            "sub_scores": true},
        {"team_id": TrueTeam[game.homeTeam],
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
