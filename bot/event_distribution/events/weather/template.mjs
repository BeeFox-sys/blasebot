import {MessageEmbed} from "discord.js";
import {send_channels} from "../../send_events.mjs";

import {event_flags, get_events} from "../../../util/game.mjs";

export const eventList = [];


/**
 * incinerations
 * @param {Object} event
 */
export async function eventFunction (event) {
    
    // This one is pretty easy to set up!

    let siblings = [];


    if (event.metadata.siblingIds.length) {

        siblings = await get_events(event.metadata.siblingIds);

    }

    console.log(siblings);

    const embed = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`**${event.description}**`)
        .setThumbnail("https://cdn.discordapp.com/emojis/907678547420794990.webp");

    send_channels({"sub_incineration": true}, {"embeds": [embed]});

}
