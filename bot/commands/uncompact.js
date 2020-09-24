const { getTeam } = require("../util/teamUtils");
const {compacts} = require("../schemas/subscription");
const { messageError } = require("../util/miscUtils");

const command = {
    name: "unsubscribe compact",
    aliases: ["unsubscribe small"],
    description: "Unsubscribes from the score updates of a channel\nbb!unsubscribe compact [team]",
    root: false,
    async execute(message, args) {

        if(message.guild && !message.channel.permissionsFor(message.member).has("MANAGE_CHANNELS")) return message.channel.send("You require the manage channel permission to run this command!").then(global.stats.messageFreq.mark()).catch(messageError);

        let team = await getTeam(args.join(" "));
        if(!team || team.fullName == "Null Team") return message.channel.send("I can't find that team!").then(global.stats.messageFreq.mark()).catch(messageError);

        let err, docs = await compacts.find({channel_id: message.channel.id, team:team.id});
        if(err) throw err;
        if(docs.length == 0) return message.channel.send(`You are not subscribed to ${team.fullName}'s compact score updates here!`).then(global.stats.messageFreq.mark()).catch(messageError);

        // eslint-disable-next-line no-unused-vars
        let error, doc = await compacts.deleteOne({channel_id: message.channel.id, team:team.id});
        if(error) throw error;

        message.channel.send(`Unsubscribed this channel from ${team.fullName}'s compact score updates here!!`).then(global.stats.messageFreq.mark()).catch(messageError);

    },
};

module.exports = command;