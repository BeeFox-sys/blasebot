const {TeamCache, TeamNames} = require("../blaseball-api/teams");
const {PlayerCache} = require("../blaseball-api/players");
const {DataStreamCache} = require("../blaseball-api/game");
const { MessageEmbed } = require("discord.js");



async function getTeam(name){
    let team = name?TeamCache.get(name):nullTeam;
    if(!team){
        let nameLowercase = name.toLowerCase();
        let teamName = TeamNames.findKey(team => (team.lowercase == nameLowercase || team.location == nameLowercase || team.nickname == nameLowercase || team.shorthand == nameLowercase || team.emoji == nameLowercase));
        if(!teamName) return null;
        team = TeamCache.get(teamName);
    }
    if(!team) return null;
    else return team;
}

async function generateTeamCard(team, forbidden){
    let standings = DataStreamCache.get("games").standings;
    let wins = standings.wins[team.id];
    let losses = standings.losses[team.id];
    let teamCard = new MessageEmbed()
        .setTitle(String.fromCodePoint(team.emoji) + " " + team.fullName)
        .setColor(team.mainColor)
        .addField("Lineup",playerList(team.lineup),true)
        .addField("Rotation",playerList(team.rotation),true);
    if(forbidden) teamCard.addField("Bullpen", "||"+playerList(team.bullpen)+"||",true)
        .addField("Bench", "||"+playerList(team.bench)+"||", true);
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

const {attributesList} = require("./miscUtils");
function attributes(team){
    let attrString = "";
    for(const attribute of team.permAttr){
        attrString += attributesList[attribute] +" (Permanent)\n";
    }
    for(const attribute of team.seasAttr){
        attrString += attributesList[attribute] +" (Season)\n";
    }
    for(const attribute of team.weekAttr){
        attrString += attributesList[attribute] +" (Week)\n";
    }
    for(const attribute of team.gameAttr){
        attrString += attributesList[attribute] +" (Day)\n";
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