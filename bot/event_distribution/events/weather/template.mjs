import {MessageEmbed} from "discord.js";
import {send_channels} from "../../send_events.mjs";

// eslint-disable-next-line no-unused-vars
import {event_flags, get_events, get_game} from "../../../util/game.mjs";
import {emoji_string} from "../../../util/team.mjs";

export const eventList = [];


/**
 * incinerations
 * @param {Object} event
 */
export async function eventFunction (event) {
    
    // This one is pretty easy to set up!

    let siblings = [];


    if (event.metadata.siblingIds?.length) {

        siblings = await get_events(event.metadata.siblingIds);

    }

    console.log(siblings);

    const game = await get_game(event.gameTags[0]);

    const embed = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`**${event.description}**`)
        .setAuthor("Ballclark", "https://cdn.discordapp.com/emojis/907678547420794990.webp")
        .setFooter(`Day ${game.day + 1} of season ${event.season + 1}${
            game.sim !== "thisidisstaticyo" ? ` of ${game.sim}` : ""}, ${emoji_string(game.awayTeamEmoji,true)} @ ${emoji_string(game.homeTeamEmoji,true)}`);


    send_channels({"sub_weather": true}, {"embeds": [embed]});

}
