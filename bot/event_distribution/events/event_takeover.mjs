import {event_flags} from "../../util/game.mjs";
import {send_channels} from "../send_events.mjs";

export const eventList = [
    event_flags.SITE_TAKEOVER_TEXT,
    event_flags.EMERGENCY_ALERT
];


const beingEmojis = {
    "-1": "⚠",
    "0": "<:Peanut:828816863126749254>",
    "1": "<:monitor:935131428151242752>",
    "2": "<:Boss:828817882695204864>",
    "3": "<:reader:935132100561076244>",
    "4": "<:Feedback:828816915874447360>",
    "5": "<:Lootcrates:831386031562817557>",
    "6": "🔥"
};

/**
 *
 * @param {FeedItem} event
 */
export async function eventFunction (event) {

    const being = (beingEmojis[event.metadata?.being]
        ?? "<:spacer:935135234729599026>").toString();


    const message = {
        "content": `${being} ${event.description.replace(/[\r\n]/igu, `\n${being} `)}`
    };

    send_channels({"sub_takeover": true}, message);


}
