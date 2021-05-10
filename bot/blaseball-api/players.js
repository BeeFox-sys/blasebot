

const {playerCache, playerNamesCache} = require("blaseball");

/**
 * Get Player
 * @param {string} name
 * @returns {json}
 */
async function getPlayer (name) {

    let player = await playerCache.fetch(name);

    if (!player) {

        console.log(playerNamesCache);
        const names = playerNamesCache.keys();
    
        const playerName = name.toLowerCase();


        if (!playerName) {

            return null;

        }
        const foundPlayerName = names.find((nameSearch) => nameSearch.toLowerCase() === playerName);

        if (!foundPlayerName) {

            return null;

        }
        player = await playerCache
            .fetch(await playerNamesCache
                .get(foundPlayerName));
    
    
    }
    if (!player) {

        return null;

    }
    
    return player;

}

module.exports = {
    getPlayer,
    "PlayerCache": playerCache,
    playerNamesCache
};
