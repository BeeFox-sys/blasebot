import {event_flags} from "../util/game.mjs";
import EventEmitter from "events";
import {score_event} from "../event_distribution/event_score.mjs";
import {client} from "../main.mjs";

export const event_stream = new EventEmitter();

const last_100 = [];

/**
 *
 * @param {Array<FeedItem>} events
 * @param {Date} loop_date
 */
export async function event_sorting (events) {

    
    // Don't handle events until connected to discord
    if (!client.isReady()) {
        
        return;

    }

    events.forEach((event) => {


        // we shouldn't need this dedupe, however reduancies are important
        if (last_100.includes(event.id)) {
            
            return;

        }
    
        if (event.type === event_flags.RUNS_SCORED) {
            
            score_event(event);

        }

    });

    const newIDs = events.map((event) => event.id);

    last_100.unshift(...newIDs);
    last_100.splice(100);

}
