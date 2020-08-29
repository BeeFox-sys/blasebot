const { getTeam } = require("../util/teamUtils");
const {summaries} = require("../schemas/subscription");

const command = {
    name: "unsummarize",
    aliases: [],
    description: "Unsubscribes from the summaries game of a channel\nbb!unsummarize [team]",
    async execute(message, args) {

        if(!message.guild) return message.channel.send("This command must be used in a guild!");
        if(!message.channel.permissionsFor(message.member).has("MANAGE_CHANNELS")) return message.channel.send("You require the manage channel permission to run this command!");

        let team = await getTeam(args.join(" "));
        if(!team) return message.channel.send("I can't find that team!");

        let err, docs = await summaries.find({channel_id: message.channel.id, team:team.id});
        if(err) throw err;
        if(docs.length == 0) return message.channel.send(`You are not subscribed to ${team.fullName}'s game summaries here!`);

        // eslint-disable-next-line no-unused-vars
        let error, doc = await summaries.deleteOne({channel_id: message.channel.id, team:team.id});
        if(error) throw error;

        message.channel.send(`Unsubscribed this channel from ${team.fullName}'s game summaries here!!`);

    },
};

module.exports = command;