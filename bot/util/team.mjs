import fetch from "node-fetch";
import {fetch_options} from "../util/misc.mjs";

export const nullTeam = {
    "emoji": 10067,
    "mainColor": "#999999",
    "fullName": "Null Team",
    "slogan": "I AM ERROR"
};

export const tarotCards = {
    "-1": "Fool",
    "0": "I The Magician",
    "1": "II The High Priestess",
    "2": "III The Empress",
    "3": "IIII The Emperor",
    "4": "V The Hierophant",
    "5": "VI The Lover",
    "6": "VII The Chariot",
    "7": "VIII Justice",
    "8": "VIIII The Hermit",
    "9": "X The Wheel of Fortune",
    "10": "XI Strength",
    "11": "XII The Hanged Man",
    "12": "XIII",
    "13": "XIIII Temperance",
    "14": "XV The Devil",
    "15": "XVI The Tower",
    "16": "XVII The Star",
    "17": "XVIII The Moon",
    "18": "XVIIII The Sun",
    "19": "XX Judgment",
    "default": "----"
};

export const creditLevels = {
    "0": "❌ 0D ❌",
    "1": "❌ 1D ❌",
    "2": "❌ 2D ❌",
    "3": "❌ 3D ❌",
    "4": "🟦 C 🟦",
    "5": "⭐ Low A ⭐",
    "6": "⭐ High A ⭐",
    "7": "⭐ AA ⭐",
    "8": "⭐ AAA ⭐",
    "9": "⭐ AAAA ⭐",
    "10": "⭐ AAAAA ⭐",
    "default": "-"
};

/**
 *
 * @param {string} team_id - Team ID
 * @returns {Promise} Team
 */
export async function get_team (team_id) {

    return fetch(
        `https://api.blaseball.com/database/team?id=${team_id}`,
        fetch_options
    )
        .then((result) => result.json())
        .catch(() => null);

}

/**
 *
 * @returns {json} array of active teams
 */
export async function get_active_teams () {

    return fetch(
        "https://api.blaseball.com/database/teams",
        fetch_options
    )
        .then((result) => result.json())
        .catch(() => null);

}

/**
 * Normalizes emoji
 * @param {string} emoji
 * @returns {string}
 */
export function emoji_string (emoji, fix = false) {

    return `${Number(emoji) ? String.fromCodePoint(emoji) : emoji}${fix ? "\uFE0F" : ""}`;

}
