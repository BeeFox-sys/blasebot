import {incineration_event} from "./events/event_incineration.mjs";
import {client} from "../main.mjs";
import {score_event} from "./events/event_score.mjs";

import * as EventList from "../event_catagories/index.mjs";


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

    // console.log(events);

    events.forEach((event) => {


        // we shouldn't need this dedupe, however reduancies are important
        if (last_100.includes(event.id)) {
            
            return;

        }
    
        switch (true) {

        case EventList.scores.includes(event.type):
            score_event(event);
            break;

        case EventList.incineration.includes(event.type):
            incineration_event(event);
            break;

        case event.type:
            break;

        default:
        
        }

    });

    const newIDs = events.map((event) => event.id);

    last_100.unshift(...newIDs);
    last_100.splice(100);

}
