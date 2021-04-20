
const fetch = require("node-fetch");
const {client} = global;
const NodeCache = require("node-cache");
const {Collection} = require("discord.js");
const {performance} = require("perf_hooks");

/**
 *
 * @returns {json}
 */
async function getAllTeams () {

    return await fetch(`${client.config.apiUrl}/allTeams`)
        .then((res) => {

            if (!res.ok) {

                throw new Error(res.statusText);

            }
            
            return res.json();
        
        })
        .catch((err) => console.error("Error at endpoint /allTeams:", err.message));

}

const TeamNames = new Collection();
const TeamCache = new NodeCache();

setInterval(updateTeamCache, 30 * 60 * 1000);


/**
 * Update Team Cache
 * @returns {void}
 */
async function updateTeamCache () {

    console.log("Caching teams...");
    if (client.mode === 3) {

        return;

    }
    const beginCache = performance.now();
    const res = await getAllTeams();

    if (!res) {

        // eslint-disable-next-line require-atomic-updates
        client.mode = 1;
        setTimeout(updateTeamCache, 2 * 60 * 1000);
        
        console.warn("Couldn't get a response from blaseball! trying again in 2 minutes!");

        return;
    
    }
    for (let index = 0; index < res.length; index++) {

        const team = res[index];

        TeamCache.set(team.id, team);
        TeamNames.set(team.id, {
            "lowercase": team.fullName.toLowerCase(),
            "location": team.location.toLowerCase(),
            "nickname": team.nickname.toLowerCase(),
            "shorthand": team.shorthand.toLowerCase(),
            "emoji": Number(team.emoji) ? String.fromCodePoint(team.emoji) : team.emoji
        });
    
    }
    // eslint-disable-next-line require-atomic-updates
    client.mode = 0;
    const endCache = performance.now();

    console.log(`Cached ${
        TeamCache.keys().length} Teams in ${Math.ceil(endCache - beginCache)}ms!`);
    
}

module.exports = {
    getAllTeams,
    updateTeamCache,
    TeamCache,
    TeamNames
};
