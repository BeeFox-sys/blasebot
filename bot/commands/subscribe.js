const { getTeam } = require("../util/teamUtils");
const subscriptions = require("../schemas/subscription");

const command = {
    name: "subscribe",
    aliases: [],
    description: "Subscribes a channel to a teams games",
    async execute(message, args) {

        let team = await getTeam(args.join(" "));
        if(!team) return message.channel.send("I can't find that team!");

        let err, docs = await subscriptions.find({$or: [{channel_id: message.channel.id},{guild_id:message.guild.id, team:team.id}]});
            if(err) throw err;
            if(docs.length > 0) return message.channel.send("You already have subscibed this channel to a team, or this team to a channel! use bb!unsubscibr to remove the subscription");

        // eslint-disable-next-line no-unused-vars
        let savErr, doc = new subscriptions({
            channel_id: message.channel.id,
            guild_id: message.guild.id,
            team: team.id
        }).save();
        if(savErr) throw savErr;
        return message.channel.send(`Subscribed this channel to the ${team.nickname}'s games!`);

    },
};

module.exports = command;