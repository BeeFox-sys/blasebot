const {PlayerTeams} = require("../blaseball-api/players");
const {getTeam} = require("./teamUtils.js");
const {MessageEmbed} = require("discord.js");


const {coffeeCache, bloodCache, itemCache} = require("blaseball");

/**
 * Generate a player's card
 * @param {Player} player
 * @param {Boolean} forbidden
 * @returns {Embed}
 */
async function generatePlayerCard (player, forbidden) {

    const team = await getTeam(PlayerTeams.get(player.id));
    const playerCard = new MessageEmbed()
        .setTitle(`${
            Number(team.emoji)
                ? String.fromCodePoint(team.emoji)
                : team.Emoji
        } ${player.name}${
            player.permAttr.includes("SHELLED") ? " 🥜" : ""}${
            player.permAttr.includes("ELSEWHERE") ? " 🌫" : ""}`)
        .setColor(team.mainColor)
        .addField("Team", team.fullName, true);

    if (forbidden) {

        playerCard.addField("Fingers", `||${player.totalFingers} Fingers||`, true);

    }
    if (forbidden) {

        playerCard.addField(
            "Allergic to peanuts?",
            player.peanutAllergy ? "||`Yes`||" : "||`No `||", true
        );

    }
    playerCard.addField("Fate", player.fate ?? "A roll of the dice", true)
        .addField(
            "Coffee",
            player.coffee ? await coffeeCache.fetch(player.coffee) : "Coffee?", true
        )
        .addField("Vibes", vibeString(vibes(player)), true)
        .addField("Item", player.bat ? (await itemCache.fetch(player.bat)).name : "None", true)
        .addField("Armor", player.armor ? (await itemCache.fetch(player.armor)).name : "None", true)
        .addField("Blood", player.blood ? await bloodCache.fetch(player.blood) : "Blood?", true)
        .addField("Pregame Ritual", player.ritual || "** **", true)
        .addField("Attributes", await attributes(player), true)
        .addField(
            "Soul Scream",
            soulscream(player).length > 1024
                ? `${soulscream(player).substring(0, 1023)}…`
                : soulscream(player), false
        )
        .addField("**--Stars--**", "** **", false)
        .addField("Batting", stars(battingRating(player)))
        .addField("Pitching", stars(pitchingRating(player)))
        .addField("Baserunning", stars(baserunningRating(player)))
        .addField("Defence", stars(defenceRating(player)))
        .setFooter(`${team.slogan} | ID: ${player.id}`);
    
    return playerCard;

}

/**
 * Batting Rating of a player
 * @param {Player} player
 * @returns {Number}
 */
function battingRating (player) {

    let rating = (1 - player.tragicness) ** 0.01;

    rating *= (1 - player.patheticism) ** 0.05;
    rating *= (player.thwackability * player.divinity) ** 0.35;
    rating *= (player.moxie * player.musclitude) ** 0.075;
    rating *= player.martyrdom ** 0.02;
    
    return rating;

}

/**
 * Pitching rating of a player
 * @param {player} player
 * @returns {number}
 */
function pitchingRating (player) {

    let rating = player.unthwackability ** 0.5;

    rating *= player.ruthlessness ** 0.4;
    rating *= player.overpowerment ** 0.15;
    rating *= player.shakespearianism ** 0.1;
    rating *= player.coldness ** 0.025;
    
    return rating;

}

/**
 * Defense Rating of a player
 * @param {player} player
 * @returns {number}
 */
function defenceRating (player) {

    let rating = (player.omniscience * player.tenaciousness) ** 0.2;

    rating *= (player.watchfulness * player.anticapitalism * player.chasiness) ** 0.1;
    
    return rating;

}

/**
 * Baserunning rating of a player
 * @param {player} player
 * @returns {number}
 */
function baserunningRating (player) {

    let rating = player.laserlikeness ** 0.5;

    rating *= (
        player.baseThirst * player.continuation * player.groundFriction * player.indulgence
    ) ** 0.1;
    
    return rating;

}

/**
 * Converts number to stars
 * @param {number} rating
 * @returns {string}
 */
function stars (rating) {

    const starsRating = 0.5 * Math.round(10 * rating);

    let starsString = "";

    for (let index = 0; index < Math.floor(starsRating); index++) {

        starsString += "★";
    
    }
    if (starsRating !== Math.floor(starsRating)) {

        starsString += "☆";
    
    }

    if (starsString === "") {

        starsString = "** **";

    }

    return starsString;

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

            const va = (1 / 10) ** vj,
                vb = trait[vj % trait.length] % va,
                vc = Math.floor(vb / va * 10);

            scream += letter[vc];
        
        }

    }
    
    return scream;

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

        attrString += `:green_square:${attr.title} (Day)\n`;
    
    }
    
    return attrString || "None";

}


module.exports = {
    generatePlayerCard
};
