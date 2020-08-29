const {getPlayer, generatePlayerCard} = require("../util/playerUtils");

const command = {
    name: "player",
    aliases: [],
    description: "Looks up a player\nbb!player [player name]",
    async execute(message, args) {
        let playerName = args.join(" ");
        let player = await getPlayer(playerName);
        if(!player) return message.channel.send("I couldn't find that player!");
        let playerCard = await generatePlayerCard(player);
        await message.channel.send(playerCard);
    },
};


module.exports = command;