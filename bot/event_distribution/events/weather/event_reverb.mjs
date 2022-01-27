import {MessageEmbed} from "discord.js";
import {send_channels} from "../../send_events.mjs";

// eslint-disable-next-line no-unused-vars
import {event_flags, get_events} from "../../../util/game.mjs";

export const eventList = [
    event_flags.REVERB_FULL,
    event_flags.REVERB_LINEUP,
    event_flags.REVERB_ROTATION,
    event_flags.GAINING_REVERBERATING
];


/**
 * incinerations
 * @param {Object} event
 */
export async function eventFunction (event) {
    
    const embed = new MessageEmbed()
        .setColor("#61b3ff")
        .setDescription(`**${event.description}**`)
        // eslint-disable-next-line max-len
        .setAuthor("Reverb", "https://www.blaseball.wiki/images/thumb/8/8f/Tgb_reverb.png/599px-Tgb_reverb.png", "https://www.blaseball.wiki/w/Reverb");

    send_channels({"sub_weather": true}, {"embeds": [embed]});

}
