const {TeamCache, TeamNames} = require("../blaseball-api/teams");
const {PlayerCache} = require("../blaseball-api/players");
const {games} = require("blaseball");
const {MessageEmbed} = require("discord.js");

const nullTeam = {
    "emoji": 10067,
    "mainColor": "#999999",
    "fullName": "Null Team",
    "slogan": "I AM ERROR"
};


/**
 * Get team
 * @param {teamName} name
 * @returns {json} team
 */
async function getTeam (name) {

    if (name === null) {

        return nullTeam;

    }
    let team = name ? TeamCache.get(name) : nullTeam;

    if (!team || team.fullName === "Null Team") {

        const nameLowercase = name.toLowerCase();
        const teamName = TeamNames.findKey((teamData) => teamData.lowercase === nameLowercase
        || teamData.location === nameLowercase
        || teamData.nickname === nameLowercase
        || teamData.shorthand === nameLowercase
        || teamData.emoji === nameLowercase);

        if (!teamName) {

            return null;

        }
        team = TeamCache.get(teamName);

    }
    if (!team || team.fullName === "Null Team") {

        return null;

    }

    return team;

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
    const teamCard = new MessageEmbed()
        .setTitle(`${Number(team.emoji)
            ? String.fromCodePoint(team.emoji)
            : team.emoji} ${team.fullName}`)
        .setColor(team.mainColor)
        .addField("Lineup", team.lineup.length ? playerList(team.lineup) : "uhhhhh...", true)
        .addField("Rotation", team.rotation.length ? playerList(team.rotation) : "uhhhhh...", true);

    if (forbidden) {

        teamCard.addField("Bullpen", team.bullpen.length
            ? `||${playerList(team.bullpen)}||`
            : "uhhhhh...", true)
            .addField("Bench", team.bench.length
                ? `||${playerList(team.bench)}||`
                : "uhhhhh...", true);

    }
    teamCard.addField("Championships", team.championships, true)
        .addField("Attributes", await attributes(team) || "None", true)
        .addField("Been Shamed", team.totalShames, true)
        .addField("Shamed Others", team.totalShamings, true)
        .addField("Been Shamed This Season", team.seasonShames, true)
        .addField("Shamed Others This Season", team.seasonShamings, true)
        .addField("Win-Loss", `${wins}-${losses}`)
        .setFooter(`${team.slogan} | ID: ${team.id}`);

    return teamCard;

}


const {modCache} = require("blaseball");

/**
 * Generate String
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

        attrString += `:green_square:${attr.title} (Day)\n`;

    }

    return attrString || "None";

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


module.exports = {
    getTeam,
    generateTeamCard,
    nullTeam
};
