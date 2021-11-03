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

export const leagueTeams = [
    "c73b705c-40ad-4633-a6ed-d357ee2e2bcf", // Lift
    "a37f9158-7f82-46bc-908c-c9e2dda7c33b", // Jazz Hands
    "ca3f1c8c-c025-4d8e-8eef-5be6accbeb16", // Firefighters
    "747b8e4a-7e50-4638-a973-ea7950a3e739", // Tigers
    "57ec08cc-0411-4643-b304-0e80dbc15ac7", // Wild Wings
    "d9f89a8a-c563-493e-9d64-78e4f9a55d4a", // Georgias

    "878c1bf6-0d21-4659-bfee-916c8314d69c", // Tacos
    "b63be8c2-576a-4d6e-8daf-814f8bcea96f", // Dale
    "3f8bbb15-61c0-4e3f-8e4a-907a5fb1565e", // Flowers
    "f02aeae2-5e6a-4098-9842-02d2273f25c7", // Sunbeams
    "9debc64f-74b7-4ae1-a4d6-fce0144b6ea5", // Spies
    "bb4a9de5-c924-4923-a0cb-9d1445f1ee5d", // Worms

    "36569151-a2fb-43c1-9df7-2df512424c82", // Millennials
    "b024e975-1c4a-4575-8936-a3754a08806a", // Steaks
    "b72f3061-f573-40d7-832a-5ad475bd7909", // Lovers
    "23e4cbc1-e9cd-47fa-a35b-bfa06f726cb7", // Pies
    "105bc3ff-1320-4e37-8ef0-8d595cb95dd0", // Garages
    "46358869-dce9-4a01-bfba-ac24fc56f57e", // Mechanics

    "979aee4a-6d80-4863-bf1c-ee1a78e06024", // Hawai'i Fridays
    "eb67ae5e-c4bf-46ca-bbbc-425cd34182ff", // Moist Talkers
    "bfd38797-8404-4b38-8b82-341da28b1f83", // Shoe Thieves
    "7966eb04-efcc-499b-8f03-d13916330531", // Magic
    "adc5b394-8f76-416d-9ce9-813706877b84", // Breath Mints
    "8d87c468-699a-47a8-b40d-cfb73a5660ad" // Crabs
];

/**
 * Normalizes emoji
 * @param {string} emoji
 * @returns {string}
 */
export function emojiString (emoji) {

    return Number(emoji) ? String.fromCodePoint(emoji) : emoji;

}
