import {get_game, get_events} from "../util/game.mjs";
import {get_team, emoji_string} from "../util/team.mjs";
import {model as team_subscription} from "../../schemas/team_subscription.mjs";
import {client} from "../main.mjs";
import {Permissions} from "discord.js";

const TrueTeam = {
    "8d7ba290-5f87-403c-81e3-cf5a2b6a6082": "c73b705c-40ad-4633-a6ed-d357ee2e2bcf", // Lift
    "d82a1a80-dff3-4767-bab6-484b2eb7aee1": "a37f9158-7f82-46bc-908c-c9e2dda7c33b", // Jazz Hands
    "16d1fd9b-c62b-4bed-b68a-b3a2d6e21524": "ca3f1c8c-c025-4d8e-8eef-5be6accbeb16", // Firefighters
    "86f4485a-a6db-470b-82f5-e95e6b353537": "747b8e4a-7e50-4638-a973-ea7950a3e739", // Tigers
    "23a2cea4-5df7-4ed0-bb2c-b8c297518ada": "57ec08cc-0411-4643-b304-0e80dbc15ac7", // Wild Wings
    "44d9dc46-7e81-4e21-acff-c0f5dd399ae3": "d9f89a8a-c563-493e-9d64-78e4f9a55d4a", // Georgias

    "2957236a-6077-4012-a445-8c5be111afd0": "878c1bf6-0d21-4659-bfee-916c8314d69c", // Tacos
    "89796ffb-843a-4163-8dec-1bef229c68cb": "b63be8c2-576a-4d6e-8daf-814f8bcea96f", // Dale
    "93e71a0e-80fc-46b7-beaf-d204c425fe03": "3f8bbb15-61c0-4e3f-8e4a-907a5fb1565e", // Flowers
    "57d3f614-f8d3-4dfd-b486-075f823fdb0b": "f02aeae2-5e6a-4098-9842-02d2273f25c7", // Sunbeams
    "6526d5df-6a9c-48e1-ba50-12dec0d8b22f": "9debc64f-74b7-4ae1-a4d6-fce0144b6ea5", // Spies
    "74aea6b6-34f9-48f4-b298-7345e1f9f7cb": "bb4a9de5-c924-4923-a0cb-9d1445f1ee5d", // Worms

    "b069fdc6-2204-423a-932c-09037adcd845": "36569151-a2fb-43c1-9df7-2df512424c82", // Millennials
    "0b672007-ebfb-476d-8fdb-fb66bad78df2": "b024e975-1c4a-4575-8936-a3754a08806a", // Steaks
    "b320131f-da0d-43e1-9b98-f936a0ee417a": "b72f3061-f573-40d7-832a-5ad475bd7909", // Lovers
    "76d3489f-c7c4-4cb9-9c58-b1e1bab062d1": "23e4cbc1-e9cd-47fa-a35b-bfa06f726cb7", // Pies
    "2dc7a1fa-3ae6-47ed-8c92-5d80167959f5": "105bc3ff-1320-4e37-8ef0-8d595cb95dd0", // Garages
    "e11df0cc-3a95-4159-9a84-fecbbf23ae05": "46358869-dce9-4a01-bfba-ac24fc56f57e", // Mechanics

    "effdbd8d-a54f-4049-a3c8-b5f944e5278b": "979aee4a-6d80-4863-bf1c-ee1a78e06024", // Hawai'i Fridays
    "8981c839-cbcf-47e3-a74e-8731dcff24fe": "eb67ae5e-c4bf-46ca-bbbc-425cd34182ff", // Moist Talkers
    "75667373-b350-499b-b86e-5518b6f9f6ab": "bfd38797-8404-4b38-8b82-341da28b1f83", // Shoe Thieves
    "a01f0ade-0186-464d-8c68-e19a29cb66f0": "7966eb04-efcc-499b-8f03-d13916330531", // Magic
    "b7df2ea6-f4e8-4e6b-8c98-f730701f3717": "adc5b394-8f76-416d-9ce9-813706877b84", // Breath Mints
    "b35926d4-22a3-4419-8fab-686c41687055": "8d87c468-699a-47a8-b40d-cfb73a5660ad" // Crabs
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
