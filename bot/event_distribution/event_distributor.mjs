import {incineration_event} from "./events/event_incineration.mjs";
import {client} from "../main.mjs";
import {event_flags} from "../util/game.mjs";
import {score_event} from "./events/event_score.mjs";

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
    
        switch (event.type) {

        case event_flags.RUNS_SCORED:
            score_event(event);
            break;

        case event_flags.INCINERATION_BLOCKED:
        case event_flags.INCINERATION:
            incineration_event(event);
            break;

        default:
                
        }

    });

    const newIDs = events.map((event) => event.id);

    last_100.unshift(...newIDs);
    last_100.splice(100);

}
