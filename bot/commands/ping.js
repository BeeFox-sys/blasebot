const command = {
    name: "ping",
    aliases: [],
    description: "pong!\nbb!ping",
    async execute(message, args) {
        message.channel.send("Splortsmanship!").then(global.client.messageFreq.mark()).catch(console.error);
    },
};

module.exports = command;