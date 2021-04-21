
const fetch = require("node-fetch");
const {client} = global;
const {performance} = require("perf_hooks");
const NodeCache = require("node-cache");
const {Collection} = require("discord.js");
const {TeamCache} = require("./teams");

/**
 *
 * @param {Array<uuid>} players
 * @returns {Array<players>}
 */
async function getPlayers (players) {

    return await fetch(`${client.config.apiUrl}/players?ids=${players.join(",")}`)
        .then((res) => {

            if (!res.ok) {

                throw new Error(res.statusText);

            }
            
            return res.json();
        
        })
        .catch((err) => {

            console.log(err.code);
            console.error("Error at endpoint /players:", err.message);
        
        });

}

/**
 *
 * @returns {Array<uuid>}
 */
async function getListOfPlayers () {

    return await fetch("https://api.sibr.dev/chronicler/v1/players/names")
        .then((res) => {

            if (!res.ok) {

                throw new Error(res.statusText);

            }
            
            return res.json();
        
        })
        .catch((err) => {

            console.log(err.code);
            console.error("Error at chronicler endpoint /players/names:", err.message);
        
        });

}

// PlayerCache
const PlayerNames = new Collection();
const PlayerCache = new NodeCache();

setInterval(updatePlayerCache, 15 * 60 * 1000);

/**
 * Updates player cache
 * @returns {void}
 */
async function updatePlayerCache () {

    console.log("Caching Players...");
    const beginCache = performance.now();
    const teams = TeamCache.keys();

    if (!teams.length) {

        console.log("Team cache empty, trying again in 1 minute");
        
        return client.setTimeout(updatePlayerCache, 2000 * 60);
    
    }
    
    const playerPromises = [];
    const playerIDs = Object.keys(await getListOfPlayers());
    let requests = 0;

    for (let index = 0; index < playerIDs.length; index += 120) {

        requests++;
        const endindex = Math.min(playerIDs.length, index + 120);
        const subsetIDs = playerIDs.slice(index, endindex);

        playerPromises.push(getPlayers(subsetIDs).then((players) => {

            const playerObjects = players.map((player) => ({"key": player.id,
                "val": player}));

            PlayerCache.mset(playerObjects);
            players.forEach((player) => {

                PlayerNames.set(player.name.toLowerCase(), player.id);
                
            });
            
        }));
    
    }
    await Promise.all(playerPromises);
    const endCache = performance.now();

    return console.log(`Cached ${
        PlayerCache.keys().length
    } players using ${requests} requests in ${Math.ceil(endCache - beginCache)}ms!`);
    

}

/**
 * Get Player
 * @param {string} name
 * @returns {json}
 */
async function getPlayer (name) {

    let player = PlayerCache.get(name);

    if (!player) {

        const playerName = PlayerNames.get(name.toLowerCase());

        if (!playerName) {

            return null;

        }
        player = PlayerCache.get(playerName);
    
    }
    if (!player) {

        return null;

    }
    
    return player;

}

module.exports = {
    getPlayer,
    PlayerCache,
    PlayerNames,
    updatePlayerCache
};
