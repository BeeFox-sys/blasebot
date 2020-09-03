const { messageError } = require("./util/miscUtils");

const command = {
    name: "ping",
    aliases: [],
    description: "pong!\nbb!ping",
    async execute(message, args) {
        message.channel.send("Splortsmanship!").then(global.stats.messageFreq.mark()).catch(messageError);
    },
};

module.exports = command;