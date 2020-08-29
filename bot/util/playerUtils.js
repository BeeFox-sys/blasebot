const NodeCache = require("node-cache");
const {getPlayers} = require("../blaseball-api/players");
const {TeamCache, getTeam} = require("./teamUtils.js");
const { Collection, MessageEmbed } = require("discord.js");
const { performance } = require("perf_hooks");
const debounce = require("lodash.debounce");
const client = global.client;

//PlayerCache
const PlayerNames = new Collection();
const PlayerTeams = new Collection();
const PlayerCache = new NodeCache({stdTTL:900,checkperiod:600});

let debouncedUpdate = debounce(updatePlayerCache, 5000, {leading: true, trailing:false});

TeamCache.on("del", function (key, value){
    debouncedUpdate();
});

async function updatePlayerCache(){
    console.log("Caching Players...");
    let beginCache = performance.now();
    let teams = TeamCache.keys();
    if(!teams.length) {
        client.mode = 1;
        setTimeout(updatePlayerCache,2*60*1000);
        return console.warn("Couldn't get a response from blaseball! trying again in 2 minutes!");
    }
    client.mode = 3;
    let playerPromises = [];
    for (let index = 0; index < teams.length; index++) {
        const team = TeamCache.get(teams[index]);
        let playerIDs = team.lineup.concat(team.rotation, team.bullpen, team.bench);
        playerPromises.push(
            getPlayers(playerIDs).then((players)=>{
                let playerObjects = players.map(p => {return {key: p.id, val: p};});
                PlayerCache.mset(playerObjects);
                players.forEach(player => {
                    PlayerNames.set(player.name.toLowerCase(), player.id);
                    PlayerTeams.set(player.id, team.id);
                });
            })
        );
    }
    await Promise.all(playerPromises);
    let endCache = performance.now();
    client.mode = 0;
    console.log(`Cached ${PlayerCache.keys().length} players in ${Math.ceil(endCache-beginCache)}ms!`);

}


async function getPlayer(name){
    let player = PlayerCache.get(name);
    if(!player){
        let playerName = PlayerNames.get(name.toLowerCase());
        if(!playerName) return null;
        player = PlayerCache.get(playerName);
    }
    if(!player) return null;
    else return player;
}

async function generatePlayerCard(player){
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
    return playerCard();
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


module.exports = {
    getPlayer: getPlayer,
    generatePlayerCard: generatePlayerCard,
    updatePlayerCache: updatePlayerCache,
    playerCache: PlayerCache,
    PlayerTeams: PlayerTeams
};