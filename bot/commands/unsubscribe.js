const subscriptions = require("../schemas/subscription");

const command = {
    name: "unsubscribe",
    aliases: [],
    description: "Unsubscribes from the game of a channel",
    async execute(message, args) {
        let err, docs = await subscriptions.find({channel_id: message.channel.id});
        if(err) throw err;
        if(docs.length == 0) return message.channel.send("You are not subscribed to a team here!");

        // eslint-disable-next-line no-unused-vars
        let error, doc = await subscriptions.deleteOne({channel_id: message.channel.id});
        if(error) throw error;

        message.channel.send("Unsubscribed this channel from any games!");

    },
};

module.exports = command;