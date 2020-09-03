let {guilds} = require("../schemas/guildsettings");
const NodeCache = require("node-cache");

let guildCache = new NodeCache({stdTTL:60*60});

async function getGuild(id){
    if(guildCache.has(id)) return guildCache.get(id);
    let err, guild = await guilds.findOne({guild_id:id}).then(global.client.dbQueryFreq.mark());
    if(err) throw err;
    if(!guild) guild = new guilds({
        guild_id: id,
    });
    guildCache.set(id,guild);
    return guild;
}

async function saveGuild(guild){
    let err;
    err, guild = await guild.save();
    if(err) throw err;
    guildCache.set(guild.guild_id, guild);
    return guild;
}

module.exports = {
    getGuild: getGuild,
    saveGuild: saveGuild,
};