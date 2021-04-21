const {getTeam, emojiString} = require("./teamUtils.js");
const {MessageEmbed} = require("discord.js");


const {coffeeCache, bloodCache} = require("blaseball");

/**
 * Generate a player's card
 * @param {Player} player
 * @param {Boolean} forbidden
 * @returns {Embed}
 */
async function generatePlayerCard (player, forbidden) {

    const team = await getTeam(player.leagueTeamId || player.tournamentTeamId);
    const playerCard = new MessageEmbed()
        .setTitle(`${
            emojiString(team.emoji)
        } ${player.name}${
            player.permAttr.includes("SHELLED") ? " 🥜" : ""}${
            player.permAttr.includes("ELSEWHERE") ? " 🌫" : ""}${
            player.deceased ? " 💀" : ""}`)
        .setColor(team.mainColor)
        .addField("Team", `${team.fullName}\n- ${getPosition(team, player)}`, true);

    if (player.leagueTeamId && player.tournamentTeamId) {

        const tourneyTeam = await getTeam(player.tournamentTeamId);

        playerCard
            .addField("Tournament Team", `${
                emojiString(tourneyTeam.emoji)} ${tourneyTeam.fullName}\n- ${
                getPosition(tourneyTeam, player)}`, true);
    
    }

    playerCard
        .addField("Current Vibe", (player.permAttr.includes("SCATTERED") ? (forbidden ? `||${vibeString(vibes(player))}||` : "** **") : vibeString(vibes(player))), true)
        .addField("Evolution", ((player.evolution > 0 && player.evolution < 4)
            ? `**Base ${player.evolution}**`
            : (player.evolution === 4 ? "Home" : "Base")), true)
        .addField("Peanut Allergy", player.peanutAllergy ? "Yes" : "No", true)
        .addField("Pregame Ritual", player.ritual || "** **", true)
        .addField("Coffee Style",
            player.coffee !== null ? (player.coffee == 7
                ? "Espresso"
                : await coffeeCache.fetch(player.coffee)
            ) : "Coffee?", true
        )
        .addField("Blood Type", player.blood !== null ? await bloodCache.fetch(player.blood) : "Blood?", true)
        .addField("Fate", player.fate ?? "A roll of the dice", true)
        if (forbidden) {

            playerCard.addField("Fingers", `||${player.totalFingers} Fingers||`, true)
                .addField("eDensity", `||${player.eDensity.toFixed(5)} bl/m³||`, true);

        }
    playerCard.addField("Modifications", await attributes(player), true)
        .addField("Items", items(player), false)
        .addField("**--Stars--**", "** **", false)
        .addField("Batting", ratingString(player, "hitting"))
        .addField("Pitching", ratingString(player, "pitching"))
        .addField("Baserunning", ratingString(player, "baserunning"))
        .addField("Defense", ratingString(player, "defense"))
        .addField(
            player.permAttr.includes("RETIRED") ? "**--Soulsong--**" : "**--Soulscream--**",
            soulscreamString(soulscream(player), player.soul, forbidden), false
        )
        .setFooter(`${team.slogan} | ID: ${player.id}`)
        .setURL(`https://www.blaseball.com/player/${player.id}`);
    
    return playerCard;

}

/**
 * Create the star rating for a player
 * @param {json} player
 * @param {string} statCategory
 * @returns {string}
 */
function ratingString (player, statCategory) {

    let itemBoost = 0;

    for (const item of player.items) {

        if (item.health > 0) {

            itemBoost += item[`${statCategory}Rating`];

        }
    
    }
    
    return `${
        stars(player[`${statCategory}Rating`] + itemBoost, player.evolution)
    } (${
        (player[`${statCategory}Rating`] * 5).toFixed(1)
    }${
        (itemBoost * 5).toFixed(1) != 0
            ? (itemBoost > 0 ? " + " : " - ") + Math.abs(itemBoost * 5).toFixed(1)
            : ""
    })`;

}

/**
 * Converts number to stars
 * @param {number} rating
 * @param {number} evolution
 * @returns {string}
 */
function stars (rating, evolution = 0) {

    const starsRating = 0.5 * Math.round(10 * rating);

    let starsString = (evolution > 0) ? "__" : "";

    for (let index = 0; index < Math.floor(starsRating); index++) {

        //if (index < evolution) {
        //
        //    starsString += "\u20DD";
        //
        //}

        starsString += "★";
        if (index == evolution - 1) {
            starsString += "__";
        }
    
    }
    if (starsRating !== Math.floor(starsRating)) {

        starsString += "☆";
    
    }

    if (starsString === "") {

        starsString = "** **";

    }

    return starsString;

}

const teamPositions = [
    {"id": "lineup",
        "name": "Lineup"},
    {"id": "rotation",
        "name": "Rotation"},
    {"id": "bullpen",
        "name": "Bullpen"},
    {"id": "bench",
        "name": "Bench"}
];

/**
 * Get a players position
 * @param {team} team
 * @param {player} player
 * @returns {string}
 */
function getPosition (team, player) {

    for (const position of teamPositions) {

        if (team[position.id]?.includes(player.id)) {

            return position.siteName ?? position.name;

        }
    
    }
    
    return "Not\u00a0on\u00a0roster";
    // "Not on roster" with non-breaking spaces

}

const {sim} = require("blaseball");

/**
 * Calculates vibes for a player
 * @param {player} player
 * @returns {number}
 */
function vibes (player) {

    const currentDay = sim().day;
    
    const vibeRating = 0.5 * (player.pressurization + player.cinnamon)
    // eslint-disable-next-line no-mixed-operators
    * Math.sin(Math.PI * (2 / (6 + Math.round(10 * player.buoyancy))
     // eslint-disable-next-line no-mixed-operators
     * currentDay + 0.5)) - 0.5 * player.pressurization + 0.5 * player.cinnamon;

    return vibeRating;

}

/**
 * Vibes -> string
 * @param {number} vibe
 * @returns {string}
 */
function vibeString (vibe) {

    if (vibe > 0.8) {

        return "🟩 🟩 🟩 Most Excellent";

    } else if (vibe > 0.4) {

        return "🟩 🟩 Excellent";

    } else if (vibe > 0.1) {

        return "🟩 Quality";

    } else if (vibe > -0.1) {

        return "⬜ Neutral";

    } else if (vibe > -0.4) {

        return "🟥 Less Than Ideal";

    } else if (vibe > -0.8) {

        return "🟥 🟥 Far Less Than Ideal";

    }
    
    return "🟥 🟥 🟥 Honestly Terrible";

}

/**
 * Soulscream Generator
 * @param {player} player
 * @returns {string}
 */
function soulscream (player) {

    let scream = "";
    const letter = [
        "A",
        "E",
        "I",
        "O",
        "U",
        "X",
        "H",
        "A",
        "E",
        "I"
    ];
    const trait = [
        player.pressurization,
        player.divinity,
        player.tragicness,
        player.shakespearianism,
        player.ruthlessness
    ];

    for (let vi = 0; vi < player.soul; vi++) {

        for (let vj = 0; vj < 11; vj++) {

            const va = (1 / 10) ** vi,
                vb = trait[vj % trait.length] % va,
                vc = Math.floor(vb / va * 10);

            scream += letter[vc];
        
        }

    }
    
    return scream;

}

/**
 * Formats the soulscream
 * @param {string} soulscreamStr
 * @param {number} soul
 * @param {boolean} forbidden
 * @returns {string}
 */
function soulscreamString (soulscreamStr, soul, forbidden) {

    const maxScreamLength = (forbidden ? 1005 - soul.toString().length : 1018);
    // 1024 minus the formatting and, if FK is on, the soul number
    let soulString = "***";

    if (soulscreamStr.length > maxScreamLength) {

        soulString += `${soulscreamStr.substring(0, maxScreamLength - 1)}…`;
    
    } else {

        soulString += (soul > 0 ? soulscreamStr : " ");
    
    }
    soulString += "***";
    if (forbidden) {

        soulString += ` (||${soul}\u00a0Soul||)`;

    }
    // \u00a0 is a non-breaking space
    
    return soulString;

}

const {modCache} = require("blaseball");

/**
 * Calculate Player Attributes
 * @param {player} player
 * @returns {string}
 */
async function attributes (player) {

    const playerObj = Object.create(player);
    let attrString = "";

    for (const attribute of playerObj.permAttr) {

        const attr = await modCache.fetch(attribute);

        attrString += `:yellow_square: ${attr.title}\n`;
    
    }
    for (const attribute of playerObj.seasAttr) {

        const attr = await modCache.fetch(attribute);

        attrString += `:red_square: ${attr.title}\n`;
    
    }
    for (const attribute of playerObj.weekAttr) {

        const attr = await modCache.fetch(attribute);

        attrString += `:blue_square: ${attr.title}\n`;
    
    }
    for (const attribute of playerObj.gameAttr) {

        const attr = await modCache.fetch(attribute);

        attrString += `:green_square: ${attr.title}\n`;
    
    }
    for (const attribute of player.itemAttr) {

        const attr = await modCache.fetch(attribute);

        attrString += `:white_large_square: ${attr.title}\n`;
    
    }
    
    return attrString || "None";

}

/**
 * Generate an item string
 * @param {json} player
 * @returns {string}
 */
function items (player) {

    let itemString = "";

    const slots = [
        "1️⃣",
        "2️⃣",
        "3️⃣",
        "4️⃣"
    ];

    for (let slot = 0; slot < 4; slot++) {

        itemString += `${slots[slot]}: `;
        if (slot < player.items.length) {

            itemString
                += `${player.items[slot].name} ${
                    healthString(player.items[slot].durability, player.items[slot].health)}`;
        
        } else if (slot > player.evolution) {

            itemString += ":lock:";
        
        }
        itemString += "\n";
    
    }
    
    return itemString;

}

/**
 *
 * @param {number} durability
 * @param {string} health
 * @returns {string}
 */
function healthString (durability, health) {

    if (durability === -1) {

        return "**∞**";

    }

    /*
     * \u26ab - MEDIUM BLACK CIRCLE
     * \u26aa - MEDIUM WHITE CIRCLE
     * \ufe0e - VARIATION SELECTOR-15 (forces text presentation instead of emoji)
     */
    return "\u26ab\ufe0e".repeat(health) + "\u26aa\ufe0e".repeat(durability - health);

}


module.exports = {
    generatePlayerCard
};
