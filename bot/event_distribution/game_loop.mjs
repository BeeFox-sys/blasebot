import fetch from "node-fetch";
import {event_sorting} from "../event_distribution/event_distributor.mjs";
import {fetch_options} from "../util/misc.mjs";


// Initalize the current time so that the first request doesn't get events covered by a previous instance of blasebot

let previous_loop = new Date();

// Loop!
/**
 * Runs through the events continusly
 */
async function loopData () {

    const this_loop = previous_loop;

    // Fetch new feed entries from blaseball
    const data_promise = fetch(
        `https://api.blaseball.com/database/feed/global?start=${
            this_loop.toISOString()
        }&sort=1&limit=250`,
        fetch_options
    )
        .catch((error) => {

            console.error(error);

        });


    try {

        const response = await data_promise;
    
        // Only do this if we got a response and it didn't error
        if (response !== null) {

            // null if not valid json
            const data = await response.json();
            

            // we can still get valid json error messages, so those are skipped
            if (data && Array.isArray(data)) {
        
                event_sorting(data, this_loop);

                if (data.length > 0) {

                    // Due to how this function is called, there will never be a race condition for this variable, see the comment where this function is called
                    // eslint-disable-next-line require-atomic-updates
                    previous_loop = new Date(Date.parse(data[data.length - 1].created));

                }

            } else if (data) {

                // if data is valid json but not an array, it is an error message, as this endpoint returns an array
                console.error(data);
    
            }

        }

    } catch (error) {

        const response = await data_promise;

        console.error(`Error getting feed update: ${response.status} ${response.statusText}`);
        console.error(error);

    } finally {


        /*
         * The reason we do this rather then set interval is so that we don't have several requests happening at once, else we get multiple requests asking for the same time frame at points
         * Being a few seconds late is preferable to duplicates, as the time is meant to be the deduplication process (as events can't happen at the same time due to tgb using js for blaseball and the event loop nature of js)
         * which apparently This Doesn't Work so we need to do deduplication later on down the line
         * Update: apparently this does work but we still dedupe later on to be safe
         */
        setTimeout(() => {

            loopData();

        }, this_loop.toUTCString() + 1200 - Date.now());
    
    }

}

loopData();
