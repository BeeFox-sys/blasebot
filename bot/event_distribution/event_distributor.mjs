import {client} from "../main.mjs";
import eventList from "./events/index.mjs";

const last_100 = [];

/**
 *
 * @param {Array<FeedItem>} events
 * @param {Boolean} debug
 */
export async function event_sorting (events, debug = false) {

    
    // Don't handle events until connected to discord
    if (!client.isReady()) {
        
        return;

    }

    // console.log(events);

    events.forEach((event) => {


        // we shouldn't need this dedupe, however reduancies are important
        if (last_100.includes(event.id) && !debug) {
            
            return;

        }

        eventList.forEach((eventDistributor) => {

            if (eventDistributor.eventList.includes(event.type)) {

                eventDistributor.eventFunction(event);

            }
        
        });
            
    });

    if (debug) {

        return;

    }
    const newIDs = events.map((event) => event.id);

    last_100.unshift(...newIDs);
    last_100.splice(100);

}
