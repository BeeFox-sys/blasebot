import fetch from "node-fetch";
import {fetch_options} from "./misc.mjs";

export const event_flags = {
    "UNDEFINED_TYPE": -1,
    "LETS_GO": 0,
    "PLAY_BALL": 1,
    "HALF_INNING": 2,
    "PITCHER_CHANGE": 3,
    "STOLEN_BASE": 4,
    "WALK": 5,
    "STRIKEOUT": 6,
    "FLYOUT": 7,
    "GROUND_OUT": 8,
    "HOME_RUN": 9,
    "HIT": 10,
    "GAME_END_LOG": 11,
    "PLATE_APPEARANCE": 12,
    "STRIKE": 13,
    "BALL": 14,
    "FOUL_BALL": 15,
    "SOLAR_PANELS_ACTIVATION": 20,
    "HOME_FIELD_ADVANTAGE_ACTIVATION": 21,
    "HIT_BY_PITCH": 22,
    "PLAYER_SKIPPED": 23,
    "PARTYING": 24,
    "STRIKE_ZAPPED_BY_ELECTRIC_BLOOD": 25,
    "WEATHER_CHANGE": 26,
    "MILD_PITCH": 27,
    "END_OF_INNING": 28,
    "SITE_TAKEOVER_TEXT": 29,
    "BLACK_HOLE_COLLECT_10": 30,
    "SUN_2_COLLECT_10": 31,
    "BIRDS_CIRCLING": 33,
    "FRIEND_OF_CROWS_ACTIVATION": 34,
    "BIRDS_FREE_PLAYER": 35,
    "GAIN_TRIPLE_THREAT": 36,
    "GAIN_A_FREE_REFILL": 37,
    "GAIN_OR_LOSE_WTIRED": 39,
    "FEEDBACK_SWAP_BLOCKED": 40,
    "FEEDBACK_SWAP": 41,
    "SUPERALLERGIC_REACTION": 45,
    "YUMMY_REACTION": 46,
    "ALLERGIC_REACTION": 47,
    "GAINING_REVERBERATING": 48,
    "ROSTER_SHUFFLE": 49,
    "TRANSFUSION": 51,
    "BLOODDRAIN_SIPHON_ACTIVATION": 52,
    "TRANSFUSION_BLOCKED": 53,
    "INCINERATION": 54,
    "INCINERATION_BLOCKED": 55,
    "FLAG_PLANTED": 56,
    "RENOVATION_BUILT": 57,
    "LIGHT_SWITCH_TOGGLE": 58,
    "DECREE_PASSED": 59,
    "BLESSING_WON": 60,
    "WILL_RECEIVED": 61,
    "BASERUNNERS_SWEPT": 62,
    "INNING_BEGINS_AGAIN": 63,
    "POLARITY_SHIFT": 64,
    "ENTER_SECRET_BASE": 65,
    "EXIT_SECRET_BASE": 66,
    "CONSUMERS_ATTACK": 67,
    "ECHO_CHAMBER": 69,
    "GRIND_RAIL": 70,
    "TUNNELS_USED": 71,
    "PEANUT_MISTER": 72,
    "PEANUTS_FLAVOR_TEXT": 73,
    "TASTING_THE_INFINITE": 74,
    "EVENT_HORIZON_ACTIVATION": 76,
    "EVENT_HORIZON_AWAITS": 77,
    "SOLAR_PANELS_START_UP_TEXT": 78,
    "SOLAR_PANELS_OVERFLOW_RUN_COLLECTION": 79,
    "TAROT_READING": 81,
    "EMERGENCY_ALERT": 82,
    "RETURN_FROM_ELSEWHERE": 84,
    "OVER_UNDER": 85,
    "UNDER_OVER": 86,
    "UNDERSEA": 88,
    "HOMEBODY": 91,
    "SUPERYUMMY": 92,
    "PERK": 93,
    "EARLBIRD": 96,
    "LATE_TO_THE_PARTY": 97,
    "SHAME_DONOR": 99,
    "ADDED_MODIFICATION": 106,
    "REMOVED_MODIFICATION": 107,
    "TIMED_MODIFICATION_EXPIRES": 108,
    "PLAYER_ADDED_TO_TEAM": 109,
    "NECROMANCY": 110,
    "RETURNED": 111,
    "PLAYER_REMOVED_FROM_TEAM": 112,
    "PLAYER_TRADE": 113,
    "PLAYER_SWAP_WITHIN_TEAM": 114,
    "PLAYER_MOVE": 115,
    "INCINERATION_REPLACEMENT": 116,
    "STAT_INCREASE": 117,
    "STAT_DECREASE": 118,
    "STAT_REROLL": 119,
    "SUPERALLERGIC_STAT_CHANGE": 122,
    "FAILED_PLAYER_MOVE_DUE_TO_FORCE": 124,
    "ENTER_THE_HALL_OF_FLAME": 125,
    "EXIT_THE_HALL_OF_FLAME": 126,
    "GAINED_ITEM": 127,
    "LOST_ITEM": 128,
    "REVERB_FULL": 130,
    "REVERB_LINEUP": 131,
    "REVERB_ROTATION": 132,
    "TEAM_INCINERATION_REPLACEMENT": 133,
    "TEAM_JOINS_DIVISION": 135,
    "PLAYER_JOINS_LEAGUE_ODDLY": 136,
    "PLAYER_HATCHED": 137,
    "TEAM_JOINS_LEAGUE": 138,
    "PLAYER_EVOLVES": 139,
    "TEAM_WINS_INTERNET_SERIES": 141,
    "POSTSEASON_SPOT": 142,
    "FINAL_STANDINGS": 143,
    "MODIFICATION_CHANGE_": 144,
    "PLAYERS_ALTERNATE_IS_CALLED": 145,
    "ADD_MOD_FROM_MOD": 146,
    "REMOVE_MOD_FROM_MOD": 147,
    "CHANGED_MOD_FROM_MOD": 148,
    "NECROMANCY_NARRATION": 149,
    "RETURNED_PLAYER_IS_PERMITTED_TO_STAY": 150,
    "DECREE_NARRATION": 151,
    "WILL_RESULTS": 152,
    "TEAM_STAT_ADJUSTMENT": 153,
    "TEAM_SHAMED": 154,
    "TEAM_SHAMES": 155,
    "SUN_2_ACTIVATION": 156,
    "BLACK_HOLE_ACTIVATION": 157,
    "ELIMINATED_FROM_POSTSEASON": 158,
    "POSTSEASON_ADVANCE": 159,
    "PLAYER_GAINED_BLOOD_TYPE": 161,
    "HIGH_PRESSURE": 165,
    "LINEUP_SORTED": 166,
    "BUTTON": 168,
    "ECHO_MESSAGE": 169,
    "SUPERPOSITION": 170,
    "REMOVE_MODS_FROM_MOD": 171,
    "ADD_MODS_FROM_MOD": 172,
    "PSYCHOACOUSTICS": 173,
    "RECEIVER_BECOMES_AN_ECHO": 174,
    "INVESTIGATION_PROGRESS": 175,
    "ELECTION_RESULTS_TIDINGS": 176,
    "GLITTER_CRATE_DROP": 177,
    "MIDDLING": 178,
    "PLAYER_ATTRIBUTE_INCREASE": 179,
    "PLAYER_ATTRIBUTE_DECREASE": 180,
    "ENTERING_A_CRIME_SCENE": 181,
    "AMBITIOUS": 182,
    "UNAMBITIOUS": 183,
    "COASTING": 184,
    "ITEM_BREAKS": 185,
    "ITEM_DAMAGED": 186,
    "BROKEN_ITEM_REPAIRED": 187,
    "DAMAGED_ITEM_REPAIRED": 188,
    "COMMUNITY_CHEST_OPENS": 189,
    "NO_FREE_ITEM_SLOT": 190,
    "FAX_MACHINE_ACTIVATION": 191,
    "HOTEL_MOTEL_HOLIDAY_INNING": 192,
    "PRIZE_MATCH_DECLARING_WHAT_THE_PRIZE_IS": 193,
    "TEAM_RECEIVED_GIFTS": 194,
    "SMITHY_ACTIVATION": 195,
    "PLAYER_ENTER_VAULT": 196,
    "A_BLOOD_TYPE": 198,
    "PLAYER_SOUL_INCREASE": 199,
    "NARRATIVE_BEING_ACTIONS": 201,
    "LIBRARY_PRE_SEASON": 202,
    "RATIFIED": 203,
    "SMASH_BAD_GATEWAY_BROKEN": 204,
    "HYPE_BUILT_IN_BALLPARK": 206,
    "PRACTICING_MODERATION": 208,
    "RUNS_SCORED": 209,
    "LEAGUE_MODIFICATION_ADDED": 210,
    "LEAGUE_MODIFICATION_REMOVED": 211,
    "BALLOONS_INFLATED_FROM_WIN": 213,
    "WIN_COLLECTED_REGULAR_SEASON": 214,
    "WIN_COLLECTED_POSTSEASON": 215,
    "GAME_OVER": 216,
    "PRESSURE_BUILT": 217,
    "TUNNEL_USED_NOTHING_FOUND": 218,
    "TUNNEL_USED_FLED_ELSEWHERE": 219,
    "TUNNEL_USED_STOLE_ITEM": 220,
    "TEAM_WILL_RETURN": 222,
    "WEATHER_EVENT": 223,
    "ELEMENT_ADDED_TO_ITEM": 224,
    "SUN_30_SMILES": 226,
    "VOICEMAIL_ACTIVATION": 228,
    "PHANTOM_THIEVES_GUILD_STEALS_ITEM": 230,
    "PHANTOM_THIEVES_GUILD_STEALS_PLAYER": 231,
    "TUMBLEWEED_SOUNDS": 232,
    "TRADER_TRAITOR": 233,
    "TRADE_FAILED": 234,
    "ITEM_TRADED": 236,
    "CYCLING_PITCHER_CYCLES_OUT": 237,
    "SNACK_PAYOUTS_TO_BEINGS": 238,
    "PLAYER_RELOADS_THE_BASES": 239,
    "VAULT_REVEALED": 241,
    "WEATHER_REPORT_ARRIVES": 243,
    "MULTIPLE_PLAYERS_ADDED_TO_TEAM": 244,
    "MULTIPLE_PLAYERS_REMOVED_FROM_TEAM": 244,
    "GAME_CANCELLED": 246,
    "SUNSUN_SUPERNOVA": 247,
    "BLACK_HOLE_AGITATION": 249,
    "GAME_ENDS_DUE_TO_TEAM_NULLIFICATION": 250,
    "JAZZ_RIFF_OPENS": 251,
    "NIGHT_NIGHT_SHIFT": 252,
    "TAROT_CARD_CHANGED": 253,
    "STUCK": 254,
    "STABLES_HORSE_POWER_ACHIEVED": 255,
    "DIAGONAL": 256,
    "LOCATION": 257,
    "COIN_DEAD": 259
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
        .catch((error) => {

            throw error;

        });

}

/**
 *
 * @param {string} id - Game ID
 * @returns {Promise} - Game Json
 */
export async function get_game (id) {

    return fetch(`https://api.blaseball.com/api/games/${id}`)
        .then((result) => result.json())
        .catch(() => null);

}
