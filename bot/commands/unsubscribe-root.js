const { messageError } = require("../util/miscUtils");

const command = {
    name: "unsubscribe",
    aliases: [],
    description: "Unsubscribes to events from blaseball\nbb!subscibe",
    root: true,
    async execute(message, args) {
        message.channel.send("Use bb!help to see a list of events you can unsubscribe from").then(global.stats.messageFreq.mark()).catch(messageError);
    },
};

module.exports = command;