import {MessageEmbed} from "discord.js";
import {send_channels} from "../send_events.mjs";

/**
 * incinerations
 * @param {Object} event
 */
export async function incineration_event (event) {
    
    // This one is pretty easy to set up!

    const embed = new MessageEmbed()
        .setColor("WHITE")
        .setDescription(event.description);


    send_channels({"sub_incineration": true}, {embed});

}
