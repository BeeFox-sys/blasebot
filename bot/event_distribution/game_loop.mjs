import fetch from "node-fetch";
import {event_sorting} from "../event_distribution/event_manager.mjs";


// Initalize the current time so that the first request doesn't get events covered by a previous instance of blasebot

let previous_loop = new Date();

const fetch_options = {
    "method": "GET",
    "headers": {
        "User-Agent": "Blasebot"
    }

};

// Loop!
/**
 * Runs through the events continusly
 */
async function loopData () {

    const this_loop = previous_loop;

    previous_loop = new Date();

    // Fetch new feed entries from blaseball
    const data_promise = fetch(
        `https://api.blaseball.com/database/feed/global?start=${
            this_loop.toISOString()
        }&sort=1`,
        fetch_options
    );


    const response = await data_promise;
    
    // Null if not valid json
    const data = await response.json()
        .catch(() => null);

    if (data) {
        
        // console.log("Loop Time: ", this_loop.toISOString());
        event_sorting(data, this_loop);

    }


    /*
     * The reason we do this rather then set interval is so that we don't have several requests happening at once, else we get multiple requests asking for the same time frame at points
     * Being a few seconds late is preferable to duplicates, as the time is meant to be the deduplication process (as events can't happen at the same time due to tgb using js for blaseball and the event loop nature of js)
     * which apparently This Doesn't Work so we need to do deduplication later on down the line
     */
    setTimeout(() => {

        loopData();

    }, this_loop.toUTCString() + 1000 - Date.now());

}

loopData();
