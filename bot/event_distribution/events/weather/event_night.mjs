import {MessageEmbed} from "discord.js";
import {send_channels} from "../../send_events.mjs";

// eslint-disable-next-line no-unused-vars
import {event_flags, get_events} from "../../../util/game.mjs";

export const eventList = [event_flags.NIGHT_NIGHT_SHIFT];


/**
 * incinerations
 * @param {Object} event
 */
export async function eventFunction (event) {

    const embed = new MessageEmbed()
        .setColor("NOT_QUITE_BLACK")
        .setDescription(`**${event.description}**`)
        .setAuthor("Night", "https://www.blaseball.wiki/images/0/03/Weather_night.png", "https://www.blaseball.wiki/w/Night");

    send_channels({"sub_weather": true}, {"embeds": [embed]});

}
