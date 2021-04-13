const { messageError } = require("../../util/miscUtils");

const command = {
    name: "love",
    aliases: ["iloveyou"],
    description: "pong!\nbb!ping",
    root: false,
    hide: true,
    async execute(message, args) {
        message.channel.send("❤ And I love you ❤").then(global.stats.messageFreq.mark()).catch(messageError);
    },
};

module.exports = command;