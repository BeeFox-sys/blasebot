const { messageError } = require("../util/miscUtils");

const command = {
    name: "subscribe",
    aliases: [],
    description: "Subscribes to events from blaseball\nbb!subscibe",
    root: true,
    async execute(message, args) {
        message.channel.send("Use bb!help to see a list of events you can subscribe to").then(global.stats.messageFreq.mark()).catch(messageError);
    },
};

module.exports = command;