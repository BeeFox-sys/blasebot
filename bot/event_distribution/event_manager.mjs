import {event_flags} from "../util/game.mjs";
import {emojiString} from "../util/team.mjs";

/**
 *
 * @param {Array<FeedItem>}events
 */
export async function event_sorting (events) {
    
    events.forEach((event) => {

        // console.log(event_types[event.type] ?? "Unknown Event", " - ", event.description);

        // console.log
    
        if (event.type === event_flags.RUNS_SCORED) {

            console.log(`${
                emojiString(event.metadata.homeEmoji)} ${event.metadata.homeScore} - ${
                emojiString(event.metadata.awayEmoji)} ${event.metadata.awayScore}\n| ${event.description}`);
        
        }

    });

}

import EventEmitter from "events";
export const event_stream = new EventEmitter();
