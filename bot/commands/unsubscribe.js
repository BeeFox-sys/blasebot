const {subscriptions} = require("../schemas/subscription");
const { messageError } = require("../util/miscUtils");

const command = {
    name: "unsubscribe",
    aliases: [],
    description: "Unsubscribes from the game of a channel\nbb!unsubscribe",
    async execute(message, args) {

        if(message.guild && !message.channel.permissionsFor(message.member).has("MANAGE_CHANNELS")) return message.channel.send("You require the manage channel permission to run this command!").then(global.stats.messageFreq.mark()).catch(messageError);

        let err, docs = await subscriptions.find({channel_id: message.channel.id});
        if(err) throw err;
        if(docs.length == 0) return message.channel.send("You are not subscribed to a team here!").then(global.stats.messageFreq.mark()).catch(messageError);

        // eslint-disable-next-line no-unused-vars
        let error, doc = await subscriptions.deleteOne({channel_id: message.channel.id});
        if(error) throw error;

        message.channel.send("Unsubscribed this channel from any games!").then(global.stats.messageFreq.mark()).catch(messageError);

    },
};

module.exports = command;