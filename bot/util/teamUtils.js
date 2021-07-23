const {TeamCache} = require("../blaseball-api/teams");
const {PlayerCache} = require("../blaseball-api/players");
const {games} = require("blaseball");
const {MessageEmbed} = require("discord.js");

const nullTeam = {
    "emoji": 10067,
    "mainColor": "#999999",
    "fullName": "Null Team",
    "slogan": "I AM ERROR"
};

const tarotCards = {
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

const creditLevels = {
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

const leagueTeams = [
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
 * Get team
 * @param {teamName} id
 * @returns {json} team
 */
async function getTeam (id) {

    if (!id) {

        return nullTeam;

    }

    return id ? TeamCache.get(id) : nullTeam;

}

/**
 * Generate a team card embed
 * @param {json} team
 * @param {boolean} forbidden
 * @returns {embed}
 */
async function generateTeamCard (team, forbidden) {

    const {standings} = games();
    const wins = standings.wins[team.id] ?? 0;
    const losses = standings.losses[team.id] ?? 0;
    const gamesPlayed = standings.gamesPlayed[team.id] ?? 0;
    const runs = standings.runs[team.id] ?? 0;

    const teamCard = new MessageEmbed()
        .setTitle(`${
            emojiString(team.emoji)
        } ${team.fullName}${
            team.level > 4 ? " 🔴" : ""}${
            team.seasAttr.includes("PARTY_TIME") ? " 🎉" : ""}${
            team.deceased ? " 💀" : ""}`)
        .setColor(team.mainColor)
        .addField(`Lineup (${team.lineup?.length ?? 0})`, team.lineup?.length
            ? playerList(team.lineup)
            : "*Empty*", true)
        .addField(`Rotation (${team.rotation?.length ?? 0})`, team.rotation?.length
            ? playerList(team.rotation)
            : "*Empty*", true);

    if (forbidden) {

        teamCard.addField(`Shadows (${team.shadows?.length ?? 0})`, team.shadows?.length
            ? `||${playerList(team.shadows)}||`
            : "*Empty*", true);

    }
    teamCard.addField("Modifications", await attributes(team) || "None", true)
        .addField("Championships", "🟡".repeat(team.championships) || "** **", true)
        .addField(
            "Underchampionships",
            "🟣".repeat(team.underchampionships) || "** **", true
        )
        .addField("Level", creditLevels[team.level] ?? creditLevels.default, true);
    if (team.imPosition) {

        const imPosX = team.imPosition[0].toFixed(3);
        const imPosY = (1 - team.imPosition[1]).toFixed(3);

        teamCard.addField("imPosition", `X: ${imPosX}\nY: ${imPosY}`, true);

    }
    teamCard.addField("eDensity", `${team.eDensity.toFixed(5)} bl/m³`, true);
    if (leagueTeams.includes(team.id)) {

        teamCard.addField("Tarot Card", tarotCards[team.card] ?? tarotCards.default, true);

    }
    teamCard.addField("Times Evolved", team.evolution, true)
        .addField("Been Shamed", team.totalShames, true)
        .addField("Shamed Others", team.totalShamings, true)
        .addField("Been Shamed This Season", team.seasonShames, true)
        .addField("Shamed Others This Season", team.seasonShamings, true)
        .addField("Runs This Season", runs, true)
        .addField("Season Record", `${wins} Wins (${gamesPlayed - losses}-${losses})`, true)
        .setFooter(`${team.slogan} | ${team.shorthand} | ID: ${team.id}`)
        .setURL(`https://www.blaseball.com/team/${team.id}`);

    return teamCard;

}


const {modCache} = require("blaseball");

/**
 * Generate formatted list of a team's attributes by type
 * @param {json} team
 * @returns {string}
 */
async function attributes (team) {

    const teamData = Object.create(team);
    let attrString = "";

    for (const attribute of teamData.permAttr) {

        const attr = await modCache.fetch(attribute);

        attrString += `:yellow_square: ${attr.title}\n`;

    }
    for (const attribute of teamData.seasAttr) {

        const attr = await modCache.fetch(attribute);

        attrString += `:red_square: ${attr.title}\n`;

    }
    for (const attribute of teamData.weekAttr) {

        const attr = await modCache.fetch(attribute);

        attrString += `:blue_square: ${attr.title}\n`;

    }
    for (const attribute of teamData.gameAttr) {

        const attr = await modCache.fetch(attribute);

        attrString += `:green_square: ${attr.title}\n`;

    }

    return attrString || "*None*";

}

/**
 *
 * @param {Array<uuid>} players
 * @returns {string}
 */
function playerList (players) {

    const playerlist = PlayerCache.mget(players);
    let list = "";

    for (const player in playerlist) {

        if (Object.prototype.hasOwnProperty.call(playerlist, player)) {

            const playerinfo = playerlist[player];
            const playername = playerinfo.name;

            list += `${playername}\n`;

        }

    }

    return list;

}

/**
 * Normalizes emoji
 * @param {string} emoji
 * @returns {string}
 */
function emojiString (emoji) {

    return Number(emoji) ? String.fromCodePoint(emoji) : emoji;

}


module.exports = {
    getTeam,
    generateTeamCard,
    nullTeam,
    tarotCards,
    creditLevels,
    leagueTeams,
    emojiString
};
