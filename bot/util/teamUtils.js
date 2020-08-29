const NodeCache = require("node-cache");
const {getAllTeams} = require("../blaseball-api/teams");
const { Collection } = require("discord.js");
const client = global.client;
const { performance } = require("perf_hooks");
var debounce = require("lodash.debounce");

//TeamCache
const TeamNames = new Collection();
const TeamCache = new NodeCache({stdTTL:900,checkperiod:600});
async function updateTeamCache(){
    console.log("Caching teams...");
    if(client.mode == 3) return;
    let beginCache = performance.now();
    let res = await getAllTeams();
    if(!res) {
        client.mode = 1;
        setTimeout(updateTeamCache,2*60*1000);
        return console.warn("Couldn't get a response from blaseball! trying again in 2 minutes!");
    }
    client.mode = 3;
    for (let index = 0; index < res.length; index++) {
        const team = res[index];
        TeamCache.set(team.id, team);
        TeamNames.set(team.id, {
            lowercase: team.fullName.toLowerCase(),
            location: team.location.toLowerCase(),
            nickname: team.nickname.toLowerCase(),
            shorthand: team.shorthand.toLowerCase(),
            emoji: String.fromCodePoint(team.emoji)
        });
    }
    client.mode = 0;
    let endCache = performance.now();
    console.log(`Cached ${TeamCache.keys().length} Teams in ${Math.ceil(endCache-beginCache)}ms!`);
    return;
}

let debouncedUpdate = debounce(updateTeamCache, 5000, {leading: true, trailing:false});

TeamCache.on("del", function (key, value){
    debouncedUpdate();
});

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


module.exports = {
    getTeam: getTeam,
    updateTeamCache: updateTeamCache,
    TeamCache: TeamCache
};