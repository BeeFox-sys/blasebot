const {TeamCache, TeamNames} = require("../blaseball-api/teams");
const {PlayerCache} = require("../blaseball-api/players");
const {games} = require("blaseball");
const { MessageEmbed } = require("discord.js");



async function getTeam(name){
    if(name == undefined) return nullTeam;
    let team = name?TeamCache.get(name):nullTeam;
    if(!team || team.fullName == nullTeam.fullName){
        let nameLowercase = name.toLowerCase();
        let teamName = TeamNames.findKey(team => (team.lowercase == nameLowercase || team.location == nameLowercase || team.nickname == nameLowercase || team.shorthand == nameLowercase || team.emoji == nameLowercase));
        if(!teamName) return null;
        team = TeamCache.get(teamName);
    }
    if(!team || team.fullName == nullTeam.fullName) return null;
    else return team;
}

async function generateTeamCard(team, forbidden){
    let standings = games().standings;
    let wins = standings.wins[team.id] ?? 0;
    let losses = standings.losses[team.id] ?? 0;
    let gamesPlayed = standings.gamesPlayed[team.id] ?? 0;
    let runs = standings.runs[team.id] ?? 0;

    let teamCard = new MessageEmbed()
        .setTitle(emojiString(team.emoji) + " " + team.fullName)
        .setColor(team.mainColor)
        .setURL("https://www.blaseball.com/team/" + team.id)
        .addField("Lineup",team.lineup.length?playerList(team.lineup):"*Empty*",true)
        .addField("Rotation",team.rotation.length?playerList(team.rotation):"*Empty*",true);
    if(forbidden) teamCard.addField("Bullpen", team.bullpen.length ? "||" + playerList(team.bullpen) + "||" : "||*Empty*||", true)
        .addField("Bench", team.bench.length ? "||" + playerList(team.bench) + "||" : "||*Empty*||", true);
    teamCard.addField("Modifications", await attributes(team), true)
        .addField("Level", creditLevels[team.level] || "-", true)
        .addField("eDensity", team.eDensity.toFixed(5) + " bl/m³", true)
        .addField("Tarot Card", tarotCards[team.card] || "---- -----", true)
        .addField("Championships","🟡".repeat(team.championships) || "** **", true)
        .addField("Times Evolved", team.evolution, true)
        .addField("Been Shamed",team.totalShames, true)
        .addField("Shamed Others",team.totalShamings,true)
        .addField("Runs This Season", runs, true)
        .addField("Been Shamed This Season", team.seasonShames, true)
        .addField("Shamed Others This Season", team.seasonShamings, true)
        .addField("Season Record",`${wins} Wins (${gamesPlayed - losses}-${losses})`)
        .setFooter(`${team.slogan} | ${team.shorthand} | ID: ${team.id}`);
    return teamCard;
}


const {modCache} = require("blaseball");
async function attributes(team){
    team = Object.create(team);
    let attrString = "";
    for(const attribute of team.permAttr){
        let attr = await modCache.fetch(attribute);
        attrString += (attr.title) +" (Permanent)\n";
    }
    for(const attribute of team.seasAttr){
        let attr = await modCache.fetch(attribute);
        attrString += (attr.title) +" (Season)\n";
    }
    for(const attribute of team.weekAttr){
        let attr = await modCache.fetch(attribute);
        attrString += (attr.title) +" (Week)\n";
    }
    for(const attribute of team.gameAttr){
        let attr = await modCache.fetch(attribute);
        attrString += (attr.title) +" (Day)\n";
    }
    return attrString || "*None*";
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

const tarotCards = {
    '-1': "Fool",
    0: "I The Magician",
    1: "II The High Priestess",
    2: "III The Empress",
    3: "IIII The Emperor",
    4: "V The Hierophant",
    5: "VI The Lover",
    6: "VII The Chariot",
    7: "VIII Justice",
    8: "VIIII The Hermit",
    9: "X The Wheel of Fortune",
    10: "XI Strength",
    11: "XII The Hanged Man",
    12: "XIII",
    13: "XIIII Temperance",
    14: "XV The Devil",
    15: "XVI The Tower",
    16: "XVII The Star",
    17: "XVIII The Moon",
    18: "XVIIII The Sun",
    19: "XX Judgment"
}

const creditLevels = {
    0: "0D",
    1: "1D",
    2: "2D",
    3: "3D",
    4: "C",
    5: "Low A",
    6: "High A",
    7: "AA",
    8: "AAA",
    9: "AAAA",
    10: "AAAAA"
}

function emojiString(emoji) {
    return Number(emoji) ? String.fromCodePoint(emoji) : emoji;
}

module.exports = {
    getTeam: getTeam,
    generateTeamCard: generateTeamCard,
    nullTeam: nullTeam,
    tarotCards: tarotCards,
    creditLevels: creditLevels,
    emojiString: emojiString
};