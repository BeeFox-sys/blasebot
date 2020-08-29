const { getTeam } = require("../util/teamUtils");
const {summaries} = require("../schemas/subscription");

const command = {
    name: "summarize",
    aliases: [],
    description: "Subscribes a channel to a teams game summaries\nA guild is only allowed one summary of each team, but unlike subscripitions they can share a channel\nbb!summarize [team name]",
    async execute(message, args) {

        if(!message.guild) return message.channel.send("This command must be used in a guild!");
        if(!message.channel.permissionsFor(message.member).has("MANAGE_CHANNELS")) return message.channel.send("You require the manage channel permission to run this command!");

        let team = await getTeam(args.join(" "));
        if(!team) return message.channel.send("I can't find that team!");

        let err, docs = await summaries.find({guild_id:message.guild.id, team:team.id});
        if(err) throw err;
        if(docs.length > 0) return message.channel.send("You already have subscibed to this teams summaries! use bb!unsummarize to remove the summaries");

        // eslint-disable-next-line no-unused-vars
        let savErr, doc = new summaries({
            channel_id: message.channel.id,
            guild_id: message.guild.id,
            team: team.id
        }).save();
        if(savErr) throw savErr;
        return message.channel.send(`Subscribed this channel to the ${team.nickname}'s game summaries!`);
    },
};

module.exports = command;