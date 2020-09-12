const {eventsCol} = require("../schemas/subscription");
const { messageError } = require("../util/miscUtils");

const command = {
    name: "unsubscribe events",
    aliases: [],
    description: "Unsubscribes a channel from the outcomes of all games\nbb!subscribe events",
    root: false,
    async execute(message, args) {

        if(message.guild && !message.channel.permissionsFor(message.member).has("MANAGE_CHANNELS")) return message.channel.send("You require the manage channel permission to run this command!").then(global.stats.messageFreq.mark()).catch(messageError);

        let err, doc = await eventsCol.findOne({guild_id: message.guild.id});
        if(err) throw err;
        if(!doc) return message.channel.send("This channel is not subscribed to the events!").then(global.stats.messageFreq.mark()).catch(messageError);

        // eslint-disable-next-line no-unused-vars
        let savErr, deldoc = await doc.deleteOne();
        if(savErr) throw savErr;
        return message.channel.send("Unsubscribed this channel outcomes for all games!").then(global.stats.messageFreq.mark()).catch(messageError);

    },
};

module.exports = command;