const command = {
    name: "ping",
    aliases: [],
    description: "pong!",
    async execute(message, args) {
        message.channel.send("Splortsmanship!");
    },
};

module.exports = command;