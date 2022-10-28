import {Embed} from "discord.js";
import {send_channels} from "../../send_events.mjs";

import {event_flags, get_game} from "../../../util/game.mjs";
import {emoji_string} from "../../../util/team.mjs";


export const eventList = [
    event_flags.ALLERGIC_REACTION,
    // event_flags.SUPERYUMMY, Disabled as it seems to be flavour text (pun intended)
    event_flags.YUMMY_REACTION,
    event_flags.SUPERALLERGIC_REACTION
];


/**
 * incinerations
 * @param {Object} event
 */
export async function eventFunction (event) {
    
    const game = await get_game(event.gameTags[0]);

    const embed = new Embed()
        .setColor("#c4aa70")
        .setDescription(`**${event.description}**`)
        // eslint-disable-next-line max-len
        .setAuthor("Peanuts", "https://www.blaseball.wiki/images/thumb/6/6e/Tgb_peanut-weather.png/800px-Tgb_peanut-weather.png", "https://www.blaseball.wiki/w/Peanuts_(weather)")
        .setFooter(`Day ${game.day + 1} of season ${event.season + 1}${
            game.sim !== "thisidisstaticyo" ? ` of ${game.sim}` : ""}, ${emoji_string(game.awayTeamEmoji,true)} @ ${emoji_string(game.homeTeamEmoji,true)}`);

    send_channels({"sub_weather": true}, {"embeds": [embed]});

}
