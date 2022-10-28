import {EmbedBuilder} from "discord.js";
import {send_channels} from "../../send_events.mjs";

import {event_flags, get_events, get_game} from "../../../util/game.mjs";
import {emoji_string} from "../../../util/team.mjs";


export const eventList = [
    event_flags.FEEDBACK_SWAP,
    event_flags.FEEDBACK_SWAP_BLOCKED
];


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

    // Capture only the first sibling, as some siblings here share the same type so we do not want repeats
    if (siblings[0]?.id !== event.id && siblings.length) {

        return;
    
    }

    siblings.shift();

    const game = await get_game(event.gameTags[0]);

    const embed = new EmbedBuilder()
        .setColor("#ed0960")
        .setDescription(`**${event.description}**\n${
            siblings.map((sib) => sib.description).join("\n")}`)
        // eslint-disable-next-line max-len
        .setAuthor({
            "name": "Feedback",
            "iconURL": "https://www.blaseball.wiki/images/thumb/8/88/Tgb_feedback.png/600px-Tgb_feedback.png",
            "url": "https://www.blaseball.wiki/w/Feedback"
        })
        .setFooter(`Day ${game.day + 1} of season ${event.season + 1}${
            game.sim !== "thisidisstaticyo" ? ` of ${game.sim}` : ""}, ${emoji_string(game.awayTeamEmoji, true)} @ ${emoji_string(game.homeTeamEmoji, true)}`);


    send_channels({"sub_weather": true}, {"embeds": [embed]});

}
