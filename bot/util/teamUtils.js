const {TeamCache, TeamNames} = require("../blaseball-api/teams");
const {PlayerCache} = require("../blaseball-api/players");
const {DataStreamCache} = require("../blaseball-api/game");
const { MessageEmbed } = require("discord.js");



async function getTeam(name){
    if(name == undefined) return nullTeam;
    let team = name?TeamCache.get(name):nullTeam;
    if(!team || team.fullName == "Null Team"){
        let nameLowercase = name.toLowerCase();
        let teamName = TeamNames.findKey(team => (team.lowercase == nameLowercase || team.location == nameLowercase || team.nickname == nameLowercase || team.shorthand == nameLowercase || team.emoji == nameLowercase));
        if(!teamName) return null;
        team = TeamCache.get(teamName);
    }
    if(!team || team.fullName == "Null Team") return null;
    else return team;
}

async function generateTeamCard(team, forbidden){
    let standings = DataStreamCache.get("games").standings;
    let wins = standings.wins[team.id] ?? 0;
    let losses = standings.losses[team.id] ?? 0;
    let teamCard = new MessageEmbed()
        .setTitle((Number(team.emoji)?String.fromCodePoint(team.emoji):team.emoji) + " " + team.fullName)
        .setColor(team.mainColor)
        .addField("Lineup",team.lineup.length?playerList(team.lineup):"uhhhhh...",true)
        .addField("Rotation",team.rotation.length?playerList(team.rotation):"uhhhhh...",true);
    if(forbidden) teamCard.addField("Bullpen", team.bullpen.length?"||"+playerList(team.bullpen)+"||":"uhhhhh...",true)
        .addField("Bench", team.bench.length?"||"+playerList(team.bench)+"||":"uhhhhh...", true);
    teamCard.addField("Championships",team.championships, true)
        .addField("Attributes", attributes(team)||"None",true)
        .addField("Been Shamed",team.totalShames, true)
        .addField("Shamed Others",team.totalShamings,true)
        .addField("Been Shamed This Season", team.seasonShames, true)
        .addField("Shamed Others This Season", team.seasonShamings, true)
        .addField("Win-Loss",`${wins}-${losses}`)
        .setFooter(`${team.slogan} | ID: ${team.id}`);
    return teamCard;
}

const attributesList = require("../data/attributes.json").collection;
function attributes(team){
    let attrString = "";
    for(const attribute of team.permAttr){
        attrString += (attributesList.find(a=>a.id==attribute)?.title??attribute) +" (Permanent)\n";
    }
    for(const attribute of team.seasAttr){
        attrString += (attributesList.find(a=>a.id==attribute)?.title??attribute) +" (Season)\n";
    }
    for(const attribute of team.weekAttr){
        attrString += (attributesList.find(a=>a.id==attribute)?.title??attribute) +" (Week)\n";
    }
    for(const attribute of team.gameAttr){
        attrString += (attributesList.find(a=>a.id==attribute)?.title??attribute) +" (Day)\n";
    }
    return attrString || "None";
}

function playerList(players){
    let playerlist = PlayerCache.mget(players);
    let list = "";
    for (const player in playerlist) {
        if (Object.prototype.hasOwnProperty.call(playerlist, player)) {
            const playerinfo = playerlist[player];
            const playername = playerinfo.name;
            list += playername+"\n"; 
        }
    }
    return list;
}

const nullTeam = {
    emoji: 10067,
    mainColor: "#999999",
    fullName: "Null Team",
    slogan: "I AM ERROR"
};


module.exports = {
    getTeam: getTeam,
    generateTeamCard: generateTeamCard,
    nullTeam:nullTeam
};