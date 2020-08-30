const {TeamCache, TeamNames} = require("../blaseball-api/teams");
const { MessageEmbed } = require("discord.js");
const { playerList } = require("./playerUtils");



async function getTeam(name){
    let team = TeamCache.get(name);
    if(!team){
        let nameLowercase = name.toLowerCase();
        let teamName = TeamNames.findKey(team => (team.lowercase == nameLowercase || team.location == nameLowercase || team.nickname == nameLowercase || team.shorthand == nameLowercase || team.emoji == nameLowercase));
        if(!teamName) return null;
        team = TeamCache.get(teamName);
    }
    if(!team) return null;
    else return team;
}

async function generateTeamCard(team){
    let teamCard = new MessageEmbed()
        .setTitle(String.fromCodePoint(team.emoji) + " " + team.fullName)
        .setColor(team.mainColor)
        .addField("Lineup",playerList(team.lineup),true)
        .addField("Rotation",playerList(team.rotation),true)
        .addField("Bullpen", playerList(team.bullpen),true)
        .addField("Bench", playerList(team.bench), true)
        .addField("Championships",team.championships, true)
        .addField("Been Shamed",team.totalShames, true)
        .addField("Shamed Others",team.totalShamings,true)
        .addField("Been Shamed This Season", team.seasonShames, true)
        .addField("Shamed Others This Season", team.seasonShamings, true)
        // .addField("Permanent Attributes", player.permAttr.join(", "),true)
        // .addField("Season Attributes", player.seasAttr.join(", "),true)
        // .addField("Week Attributes", player.weekAttr.join(", "),true)
        // .addField("Game Attributes", player.gameAttr.join(", "),true)
        .setFooter(`${team.slogan} | ID: ${team.id}`);
    return teamCard;
}


module.exports = {
    getTeam: getTeam,
    generateTeamCard: generateTeamCard,
};