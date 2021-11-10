import {event_flags} from "../util/game.mjs";
import {emojiString} from "../util/team.mjs";


const last_100 = [];

/**
 *
 * @param {Array<FeedItem>} events
 * @param {Date} loop_date
 */
export async function event_sorting (events, loop_date) {
    
    events.forEach((event) => {


        // we shouldn't need this dedupe, however reduancies are important
        if (last_100.includes(event.id)) {
            
            return;

        }
    
        if (event.type === event_flags.RUNS_SCORED) {

            console.log(`: ${loop_date.toISOString()} ~ ${event.created}\n${
                emojiString(event.metadata.homeEmoji)} ${event.metadata.homeScore} - ${
                emojiString(event.metadata.awayEmoji)} ${event.metadata.awayScore}\n| ${
                event.description}`);
        
        }

    });

    const newIDs = events.map((event) => event.id);

    last_100.unshift(...newIDs);
    last_100.splice(100);

}

import EventEmitter from "events";
export const event_stream = new EventEmitter();
