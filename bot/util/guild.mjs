import NodeCache from "node-cache";
import {model as Guilds} from "../../schemas/guild.mjs";
import {model as TeamSubs} from "../../schemas/team_subscription.mjs";
import {model as ChannelSubs} from "../../schemas/channel.mjs";
// import {Model} from "mongoose";

const guildCache = new NodeCache({"stdTTL": 60 * 60});

/**
 * Gets Guild Doc (or creates one)
 * @param {snowflake} id
 * @returns {doc}
 */
export async function getGuild (id) {

    if (guildCache.has(id)) {

        return guildCache.get(id);

    }
    let guild = await Guilds.findOne({"guild_id": id});

    if (!guild) {

        guild = new Guilds({
            "guild_id": id
        });

    }
    guildCache.set(id, guild);
    
    return guild;

}

/**
 *  Saves a guild doc
 * @param {guildDoc} guild
 * @returns {guildDoc}
 */
export async function saveGuild (guild) {

    const guildSaved = await guild.save();

    guildCache.set(guildSaved.guild_id, guildSaved);
    
    return guildSaved;

}

/**
 *
 * @param {String} channel_id
 * @param {String} team_id
 * @returns {Model}
 */
export async function getTeamSub (channel_id, team_id) {

    let teamSub = await TeamSubs.findOne({channel_id,
        team_id});

    if (!teamSub) {

        teamSub = new TeamSubs({
            channel_id,
            team_id
        });

    }
    
    return teamSub;

}

/**
 *
 * @param {*} channel_id
 * @returns {Model}
 */
export async function getChannelSub (channel_id) {

    let channelSub = await ChannelSubs.findOne({channel_id});

    if (!channelSub) {

        channelSub = new ChannelSubs({
            channel_id
        });

    }
    
    return channelSub;

}
