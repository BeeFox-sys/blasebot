import {MessageEmbed} from "discord.js";
import {send_channels} from "../send_events.mjs";

import {event_flags} from "../../util/game.mjs";

export const eventList = [
    event_flags.INCINERATION_BLOCKED,
    event_flags.INCINERATION,
    event_flags.INCINERATION_REPLACEMENT,
    event_flags.TEAM_INCINERATION_REPLACEMENT
];


/**
 * incinerations
 * @param {Object} event
 */
export async function eventFunction (event) {
    
    // This one is pretty easy to set up!

    const embed = new MessageEmbed()
        .setColor("WHITE")
        .setDescription(event.description);


    send_channels({"sub_incineration": true}, {"embeds": [embed]});

}
