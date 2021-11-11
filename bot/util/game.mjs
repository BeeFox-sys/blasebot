import fetch from "node-fetch";
import {fetch_options} from "./misc.mjs";

export const event_flags = {
    "RUNS_SCORED": 209
};

export const event_types = {
    
};


// thank you ch00beh for doing a lot of these already c:
export const event_catagories = {
    "weather": [223],
    "items": [],
    "modifications": [],
    "changes": [
        24, // Partying
        35, // Birds free shelled player
        40, // Feedback blocked
        41, // Feedback
        47, // Allergic reaction
        49, // Reverb shuffle
        51, // Blooddrain
        52, // Siphon
        54, // Incineration
        67, // Consumers attack
        72, // Peanut Mister
        74, // Tasting the infinite (Shelling)
        84 // Return from Elsewhere
    ],
    "takeover": [21],
    "incineration": [],
    "misc": [],
    "score": [],
    "flavour": [
        34, // Murder of crows
        36, // Triple Threat
        37, // Free Refill
        39, // Wired
        48, // Reverberating
        55, // Fire eating
        62, // Flood
        63, // Salmon swim upstream
        65, // Entering the Secret Base
        66, // Exiting the Secret Base
        70 // Grind Rail
    ],
    "plate": [
        4, // Stolen base
        5, // Walk
        6, // Strikeout
        7, // Flyout
        8, // Ground out
        9, // Home run
        10, // Hit (single/double/triple)
        22, // Hit by pitch
        23, // Player skipped due to being Shelled or Elsewhere
        27 // Mild pitch
    ]
};


/**
 *
 * @param {Array} events_array - array of event IDs
 * @returns {Promise} - Array of events via json
 */
export async function get_events (events_array) {

    return fetch(
        `https://api.blaseball.com/database/feed?ids=${events_array.join(",")}`,
        fetch_options
    )
        .then((result) => result.json())
        .catch(() => null);

}

/**
 *
 * @param id - Game ID
 * @returns {Promise} - Game Json
 */
export async function get_game (id) {

    return fetch(`https://api.blaseball.com/database/gameById/${id}`)
        .then((result) => result.json())
        .catch(() => null);

}
