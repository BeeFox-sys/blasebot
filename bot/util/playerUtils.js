const {PlayerTeams} = require("../blaseball-api/players");
const { getTeam } = require("./teamUtils.js");
const {MessageEmbed } = require("discord.js");



const {coffeeCache, bloodCache} = require("blaseball");

async function generatePlayerCard(player, forbidden){
    let team = await getTeam(PlayerTeams.get(player.id));
    let playerCard = new MessageEmbed()
        .setTitle((Number(team.emoji)?String.fromCodePoint(team.emoji):team.emoji) + " " + player.name + (player.permAttr.includes("SHELLED")?" 🥜":""))
        .setColor(team.mainColor)
        .setURL("https://www.blaseball.com/player/" + player.id)
        .addField("Team", team.fullName, true)
        .addField("Position", getPosition(team, player), true);
    if(forbidden) playerCard.addField("Fingers", "||" + player.totalFingers + " Fingers||", true);
    if(forbidden) playerCard.addField("eDensity", "||" + player.eDensity.toFixed(5) + " bl/m³||", true);
    playerCard.addField("Current Vibe", (player.permAttr.includes("SCATTERED") ? (forbidden ? "||" + vibeString(vibes(player)) + "||" : "** **") : vibeString(vibes(player))), true)
        .addField("Evolution", ((player.evolution > 0 && player.evolution < 4) ? "**Base " + player.evolution + "**" : (player.evolution == 4 ? "Home" : "Base")), true)
        .addField("Peanut Allergy", player.peanutAllergy?"Yes":"No", true)
        .addField("Pregame Ritual", player.ritual || "** **", true)
        .addField("Coffee Style", player.coffee?(await coffeeCache.fetch(player.coffee)):"Coffee?", true)
        .addField("Blood Type", player.blood?(await bloodCache.fetch(player.blood)): "Blood?", true)
        .addField("Fate", player.fate??"A roll of the dice", true)
        .addField((player.permAttr.includes("RETIRED")) ? "Soulsong" : "Soulscream", soulscreamString(soulscream(player), player.soul, forbidden), false)
        .addField("Items", items(player), true)
        .addField("Modifications", await attributes(player), true)
        .addField("**--Stars--**","** **", false)
        .addField("Batting", ratingString(player, "hitting"))
        .addField("Pitching", ratingString(player, "pitching"))
        .addField("Baserunning", ratingString(player, "baserunning"))
        .addField("Defense", ratingString(player, "defense"))
        .setFooter(`${team.slogan} | ID: ${player.id}`);
    return playerCard;
}

function ratingString(player, statCategory) {
    let itemBoost = 0;
    for(const item of player.items){
        if(item.health > 0) itemBoost += item[statCategory + "Rating"];
    }
    return stars(player[statCategory + "Rating"] + itemBoost) + " (" + (player[statCategory + "Rating"] * 5).toFixed(1) + ((itemBoost * 5).toFixed(1) != 0 ? (itemBoost > 0 ? " + " : " - ") + (itemBoost * 5).toFixed(1) : "") + ")";
}

/*
function battingRating(player){
    let rating = Math.pow(1-player.tragicness, 0.01); 
    rating *= Math.pow(1-player.patheticism,0.05);
    rating *= Math.pow(player.thwackability*player.divinity,0.35);
    rating *= Math.pow(player.moxie * player.musclitude,0.075);
    rating *= Math.pow(player.martyrdom,0.02);
    return rating;
}

function pitchingRating(player){
    let rating = Math.pow(player.unthwackability, 0.5);
    rating *= Math.pow(player.ruthlessness, 0.4);
    rating *= Math.pow(player.overpowerment, 0.15);
    rating *= Math.pow(player.shakespearianism, 0.1);
    rating *= Math.pow(player.coldness, 0.025);
    return rating;
}

function defenseRating(player){
    let rating = Math.pow(player.omniscience*player.tenaciousness, 0.2);
    rating *= Math.pow(player.watchfulness*player.anticapitalism*player.chasiness, 0.1);
    return rating;
}

function baserunningRating(player){
    let rating = Math.pow(player.laserlikeness, 0.5);
    rating *= Math.pow(player.baseThirst*player.continuation*player.groundFriction*player.indulgence,0.1);
    return rating;
}
*/

function stars(rating){
    let stars = 0.5 * Math.round(10*rating);

    let starsString = "";
    for (let index = 0; index < Math.floor(stars); index++) {
        starsString += "★";
    }
    if(stars != Math.floor(stars)){
        starsString += "☆";
    }

    if(starsString == "") starsString = "** **";

    return starsString;
}

const teamPositions = [
    { id: "lineup", name: "Lineup" },
    { id: "rotation", name: "Rotation" },
    { id: "bullpen", name: "Bullpen", siteName: "Shadow Lineup" }, // sic
    { id: "bench", name: "Bench", siteName: "Shadow Rotation" }
];

function getPosition(team, player){
    for(const position of teamPositions){
        if(team[position.id]?.includes(player.id)) return (position.siteName ? position.siteName + " (" + position.name + ")" : position.name);
    }
    return "Uhhhhh...";
}

const {sim} = require("blaseball");

function vibes(player){
    let currentDay = sim().day;
    let vibes = 0.5 * (player.pressurization+player.cinnamon) * 
    Math.sin(Math.PI * (2 / (6 + Math.round(10 * player.buoyancy))
     * currentDay + .5)) - 0.5 * player.pressurization + 0.5 * player.cinnamon;

    return vibes;
}

function vibeString(vibe){
    if(vibe>0.8) return "🟩 🟩 🟩 Most Excellent";
    else if(vibe > 0.4) return "🟩 🟩 Excellent";
    else if(vibe > 0.1) return "🟩 Quality";
    else if(vibe > -0.1) return "⬜ Neutral";
    else if(vibe > -0.4) return "🟥 Less Than Ideal";
    else if(vibe > -0.8) return "🟥 🟥 Far Less Than Ideal";
    else return "🟥 🟥 🟥 Honestly Terrible";
}

function soulscream(player){
    let scream = "";
    let letter = ["A", "E", "I", "O", "U", "X", "H", "A", "E", "I"];
    let trait = [player.pressurization, player.divinity, player.tragicness, player.shakespearianism, player.ruthlessness]; 
    for (let i = 0; i < player.soul; i++)
        for (var j = 0; j < 11; j++) {
            var a = 1 / Math.pow(10, i),
                b = trait[j % trait.length] % a,
                c = Math.floor(b / a * 10);
            scream += letter[c];
        }
    return scream;
}

function soulscreamString(soulscream, soul, forbidden){
  let maxScreamLength = (forbidden ? 1005 - soul.toString().length : 1018); // 1024 minus the formatting and, if FK is on, the soul number
  let soulString = "***";
  if(soulscream.length > maxScreamLength){
    soulString += soulscream.substring(0, maxScreamLength - 1) + "…";
  } else {
    soulString += (soul > 0 ? soulscream : " ");
  }
  soulString += "***";
  if(forbidden) soulString += " (||" + soul + "\u00a0Soul||)"; // \u00a0 is a non-breaking space
  return soulString;
}

const { modCache } = require("blaseball");

async function attributes(player){
    player = Object.create(player);
    let attrString = "";
    for(const attribute of player.permAttr){
        let attr = await modCache.fetch(attribute);
        attrString += (attr.title) +" (Permanent)\n";
    }
    for(const attribute of player.seasAttr){
        let attr = await modCache.fetch(attribute);
        attrString += (attr.title) +" (Season)\n";
    }
    for(const attribute of player.weekAttr){
        let attr = await modCache.fetch(attribute);
        attrString += (attr.title) +" (Week)\n";
    }
    for(const attribute of player.gameAttr){
        let attr = await modCache.fetch(attribute);
        attrString += (attr.title) +" (Day)\n";
    }
    for(const attribute of player.itemAttr){
        let attr = await modCache.fetch(attribute);
        attrString += (attr.title) +" (Item)\n";
    }
    return attrString || "*None*";
}

function items(player){
    let itemString = "";
    for(let i = 0; i < 4; i++){
        itemString += "Slot " + (i + 1) + ": "
        if(i < player.items.length){
            itemString += player.items[i].name + " [" + healthString(player.items[i].durability, player.items[i].health) + "]";
        } else if(i > player.evolution){
            itemString += ":lock:";
        }
        itemString += "\n"
    }
    return itemString;
}

function healthString(durability, health){
    if(durability === -1) return "**∞**";
    // \u26ab - MEDIUM BLACK CIRCLE
    // \u26aa - MEDIUM WHITE CIRCLE
    // \ufe0e - VARIATION SELECTOR-15 (forces text presentation instead of emoji)
    return "\u26ab\ufe0e".repeat(health) + "\u26aa\ufe0e".repeat(durability - health);
}

module.exports = {
    generatePlayerCard: generatePlayerCard
};
