const { messageError } = require("../util/miscUtils");

const command = {
    name: "refresh",
    aliases: [],
    description: "pong!\nbb!ping",
    root: false,
    hide: true,
    async execute(message, args) {
        let application = await global.client.fetchApplication();
        if(application.owner.id != message.author.id){
            message.channel.send("You cannot use this command!").then(global.stats.messageFreq.mark()).catch(messageError);
        }
        delete require.cache[require.resolve("../data/attributes.json")];
        delete require.cache[require.resolve("../data/items.json")];
        message.channel.send("Cleared Requires");
    },
};

module.exports = command;