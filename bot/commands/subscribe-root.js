const { messageError } = require("../util/miscUtils");

const command = {
    name: "subscribe",
    aliases: [],
    description: "Subscribes to events from blaseball\nbb!subscibe",
    root: true,
    async execute(message, args) {
        message.channel.send("Splortsmanship!").then(global.stats.messageFreq.mark()).catch(messageError);
    },
};

module.exports = command;