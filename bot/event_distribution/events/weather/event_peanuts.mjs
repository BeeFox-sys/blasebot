import {MessageEmbed} from "discord.js";
import {send_channels} from "../../send_events.mjs";

import {event_flags} from "../../../util/game.mjs";

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
    
    const embed = new MessageEmbed()
        .setColor("#c4aa70")
        .setDescription(`**${event.description}**`)
        // eslint-disable-next-line max-len
        .setThumbnail("https://www.blaseball.wiki/images/thumb/6/6e/Tgb_peanut-weather.png/800px-Tgb_peanut-weather.png");

    send_channels({"sub_incineration": true}, {"embeds": [embed]});

}
