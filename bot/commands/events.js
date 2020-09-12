const {eventsCol} = require("../schemas/subscription");
const { messageError } = require("../util/miscUtils");

const command = {
    name: "subscribe events",
    aliases: [],
    description: "Subscribes a channel to the outcomes of all games\nA guild can only have one event channel.\nbb!subscribe events",
    root: false,
    async execute(message, args) {

        if(message.guild && !message.channel.permissionsFor(message.member).has("MANAGE_CHANNELS")) return message.channel.send("You require the manage channel permission to run this command!").then(global.stats.messageFreq.mark()).catch(messageError);

        let err, docs = await eventsCol.find({guild_id: message.guild.id});
        if(err) throw err;
        if(docs.length > 0) return message.channel.send("There is already an event channel in this guild! use bb!unsubscribe to remove the event channel").then(global.stats.messageFreq.mark()).catch(messageError);

        // eslint-disable-next-line no-unused-vars
        let savErr, doc = new eventsCol({
            channel_id: message.channel.id,
            guild_id: message.guild?.id??message.channel.id
        }).save();
        if(savErr) throw savErr;
        return message.channel.send("Subscribed this channel outcomes for all games!").then(global.stats.messageFreq.mark()).catch(messageError);

    },
};

module.exports = command;