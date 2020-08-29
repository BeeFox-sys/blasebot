const command = {
    name: "ping",
    aliases: [],
    description: "pong!\nbb!ping",
    async execute(message, args) {
        message.channel.send("Splortsmanship!");
    },
};

module.exports = command;