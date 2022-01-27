import {MessageEmbed} from "discord.js";
import {send_channels} from "../../send_events.mjs";

import {event_flags, get_events} from "../../../util/game.mjs";

export const eventList = [
    event_flags.INCINERATION_BLOCKED,
    event_flags.INCINERATION
];


/**
 * incinerations
 * @param {Object} event
 */
export async function eventFunction (event) {
    
    // This one is pretty easy to set up!

    let siblings = [];


    if (event.metadata?.siblingIds?.length) {

        siblings = await get_events(event.metadata.siblingIds);

    }

    const embed = new MessageEmbed()
        .setColor("WHITE")
        .setDescription(`**${event.description}**\n${siblings[4]?.description ?? ""}`)
        // eslint-disable-next-line max-len
        .setAuthor("Solar Eclipse", "https://www.blaseball.wiki/images/thumb/5/51/Tgb_eclipse.png/60px-Tgb_eclipse.png", "https://www.blaseball.wiki/w/Solar_Eclipse");

    send_channels({"sub_incineration": true,
        "sub_weather": true}, {"embeds": [embed]});

}
