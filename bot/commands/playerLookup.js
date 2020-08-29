const {getTeam} = require("../util/teamUtils");
const {getPlayer, PlayerTeams} = require("../util/playerUtils");
const { MessageEmbed } = require("discord.js");

const command = {
    name: "player",
    aliases: [],
    description: "Looks up a player",
    async execute(message, args) {
        let playerName = args.join(" ");
        let player = await getPlayer(playerName);
        if(!player) return message.channel.send("I couldn't find that player!");
        let team = await getTeam(PlayerTeams.get(player.id));
        let playerCard = new MessageEmbed()
            .setTitle(String.fromCodePoint(team.emoji) + " " + player.name)
            .setColor(team.mainColor)
            .addField("Team",team.fullName, true);
        if(player.bat) playerCard.addField("Bat",player.bat, true);
        playerCard
            .addField("Fingers",player.totalFingers+" Fingers",true)
            .addField("Alergic to peanuts?",player.peanutAllergy?"Yes":"No",true)
            .addField("Fate",player.fate,true)
            .addField("Vibes",vibeString(vibes(player)), true) 
            .addField("**--Stars--**","** **")
            .addField("Batting", stars(battingRating(player)))
            .addField("Pitching", stars(pitchingRating(player)))
            // .addField("** **","** **")
            .addField("Baserunning", stars(baserunningRating(player)))
            .addField("Defence", stars(defenceRating(player)))
            .setFooter(team.slogan);
        message.channel.send(playerCard);
    },
};

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

const {GameCache} = require("../util/gameUtils");
function vibes(player){
    let currentDay = GameCache.get("games").sim.day;
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
    else if(vibe > -0.4) return "🟥 Less Then Ideal";
    else if(vibe > -0.6) return "🟥 🟥 Far Less Then Ideal";
    else return "🟥 🟥 🟥 Honestly Terrible";

}

module.exports = command;