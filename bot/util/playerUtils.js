const {PlayerTeams} = require("../blaseball-api/players");
const { getTeam } = require("./teamUtils.js");
const {MessageEmbed } = require("discord.js");



// const itemList = require("../data/items.json").collection;
const {coffeeCache, bloodCache, itemCache} = require("blaseball");

async function generatePlayerCard(player, forbidden){
    let team = await getTeam(PlayerTeams.get(player.id));
    let playerCard = new MessageEmbed()
        .setTitle((Number(team.emoji)?String.fromCodePoint(team.emoji):team.Emoji) + " " + player.name + (player.permAttr.includes("SHELLED")?" 🥜":""))
        .setColor(team.mainColor)
        .addField("Team",team.fullName, true);
    if(forbidden) playerCard.addField("Fingers","||"+player.totalFingers+" Fingers||",true);
    if(forbidden) playerCard.addField("Allergic to peanuts?",player.peanutAllergy?"||`Yes`||":"||`No `||",true);
    playerCard.addField("Fate",player.fate??"A roll of the dice",true)
        .addField("Coffee",await coffeeCache.fetch(player.coffee)??"Coffee?",true)
        .addField("Vibes",vibeString(vibes(player)), true)
        .addField("Item",player.bat?(await itemCache.fetch(player.bat)).name:"None",true) 
        .addField("Armor",player.armor?(await itemCache.fetch(player.armor)).name:"None",true)
        .addField("Blood",await bloodCache.fetch(player.blood)??"Blood?",true)
        .addField("Pregame Ritual",player.ritual||"** **",true)
        .addField("Attributes", await attributes(player),true)
        .addField("Soul Scream",soulscream(player).length > 1024 ? soulscream(player).substring(0, 1023) + "…": soulscream(player),false)
        .addField("**--Stars--**","** **",false)
        .addField("Batting", stars(battingRating(player)))
        .addField("Pitching", stars(pitchingRating(player)))
        .addField("Baserunning", stars(baserunningRating(player)))
        .addField("Defence", stars(defenceRating(player)))
        .setFooter(`${team.slogan} | ID: ${player.id}`);
    return playerCard;
}

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

function defenceRating(player){
    let rating = Math.pow(player.omniscience*player.tenaciousness, 0.2);
    rating *= Math.pow(player.watchfulness*player.anticapitalism*player.chasiness, 0.1);
    return rating;
}

function baserunningRating(player){
    let rating = Math.pow(player.laserlikeness, 0.5);
    rating *= Math.pow(player.baseThirst*player.continuation*player.groundFriction*player.indulgence,0.1);
    return rating;
}

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
            var a = 1 / Math.pow(10, j),
                b = trait[j % trait.length] % a,
                c = Math.floor(b / a * 10);
            scream += letter[c];
        }
    return scream;
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
    return attrString || "None";
}


module.exports = {
    generatePlayerCard: generatePlayerCard
};