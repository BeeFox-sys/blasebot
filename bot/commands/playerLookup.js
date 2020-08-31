const {generatePlayerCard} = require("../util/playerUtils");
const {getPlayer} = require("../blaseball-api/players");
const {getGuild} = require("../util/guildUtils");

const command = {
    name: "player",
    aliases: [],
    description: "Looks up a player\nbb!player [player name]",
    async execute(message, args) {
        let playerName = args.join(" ");
        let player = await getPlayer(playerName);
        if(!player) return message.channel.send("I couldn't find that player!");
        let forbidden;
        if(message.guild){
            let guild = await getGuild(message.guild.id);
            forbidden = guild.forbidden;
        } else {
            forbidden = false;
        }
        let playerCard = await generatePlayerCard(player, forbidden);
        await message.channel.send(playerCard);
    },
};


module.exports = command;