const {PlayerTeams} = require("../blaseball-api/players");
const { getTeam } = require("./teamUtils.js");
const {MessageEmbed } = require("discord.js");



const itemList = require("../data/items.json").collection;

async function generatePlayerCard(player, forbidden){
    let team = await getTeam(PlayerTeams.get(player.id));
    let playerCard = new MessageEmbed()
        .setTitle(String.fromCodePoint(team.emoji) + " " + player.name + (player.permAttr.includes("SHELLED")?" 🥜":""))
        .setColor(team.mainColor)
        .addField("Team",team.fullName, true);
    if(forbidden) playerCard.addField("Fingers","||"+player.totalFingers+" Fingers||",true);
    if(forbidden) playerCard.addField("Allergic to peanuts?",player.peanutAllergy?"||Yes||":"||No ||",true);
    playerCard.addField("Fate",player.fate??"A roll of the dice",true)
        .addField("Coffee",coffeeStyles[player.coffee]??"Coffee?",true)
        .addField("Vibes",vibeString(vibes(player)), true)
        .addField("Item",(itemList.find(a=>a.id==player.bat)?.name??player.bat)||"None",true) 
        .addField("Armor",(itemList.find(a=>a.id==player.armor)?.name??player.armor)||"None",true)
        .addField("Blood",bloodTypes[player.blood]??"Blood?",true)
        .addField("Pregame Ritual",player.ritual||"** **",true)
        .addField("Attributes", attributes(player),true)
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

const {DataStreamCache} = require("../blaseball-api/game");

function vibes(player){
    let currentDay = DataStreamCache.get("games").sim.day;
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

const attributesList = require("../data/attributes.json").collection;

function attributes(player){
    player = Object.create(player);
    let attrString = "";
    for(const attribute of player.permAttr){
        attrString += (attributesList.find(a=>a.id==attribute)?.title??attribute) +" (Permanent)\n";
    }
    for(const attribute of player.seasAttr){
        attrString += (attributesList.find(a=>a.id==attribute)?.title??attribute) +" (Season)\n";
    }
    for(const attribute of player.weekAttr){
        attrString += (attributesList.find(a=>a.id==attribute)?.title??attribute) +" (Week)\n";
    }
    for(const attribute of player.gameAttr){
        attrString += (attributesList.find(a=>a.id==attribute)?.title??attribute) +" (Day)\n";
    }
    return attrString || "None";
}

const coffeeStyles = {
    0: "Black",
    1: "Light & Sweet",
    2: "Macchiato",
    3: "Cream & Sugar",
    4: "Cold Brew",
    5: "Flat White",
    6: "Americano",
    8: "Heavy Foam",
    9: "Latte",
    10: "Decaf",
    11: "Milk Substitute",
    12: "Plenty of Sugar",
    13: "Anything"
};

const bloodTypes = {
    0: "A",
    1: "AA",
    2: "AAA",
    3: "Acid",
    4: "Basic",
    5: "O",
    6: "O No",
    7: "H²O",
    8: "Electric",
    9: "Love",
    10: "Fire",
    11: "Psychic",
    12: "Grass"
};


module.exports = {
    generatePlayerCard: generatePlayerCard
};