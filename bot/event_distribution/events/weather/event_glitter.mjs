import {MessageEmbed} from "discord.js";
import {send_channels} from "../../send_events.mjs";

// eslint-disable-next-line no-unused-vars
import {event_flags, get_events} from "../../../util/game.mjs";

export const eventList = [event_flags.GLITTER_CRATE_DROP];


/**
 * incinerations
 * @param {Object} event
 */
export async function eventFunction (event) {
    
    const embed = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`**${event.description}**`)
        // eslint-disable-next-line max-len
        .setAuthor("Glitter", "https://www.blaseball.wiki/images/thumb/c/c5/Tgb_glitter.png/600px-Tgb_glitter.png", "https://www.blaseball.wiki/w/Glitter");

    send_channels({"sub_weather": true}, {"embeds": [embed]});

}
