const {generatePlayerCard} = require("../../util/playerUtils");
const {getPlayer} = require("../../blaseball-api/players");
const {getGuild} = require("../../util/guildUtils");
const { interactionThunk } = require("../../util/interactionUtils");

const command = {
    action: "player",
    async execute(interaction, client) {
        let playerName = interaction.data.options[0].options[0].value;
        let player = await getPlayer(playerName);
        if(!player) return interactionThunk(interaction, client, {content:"I couldn't find player "+playerName+"!"});
        let guild = await getGuild(interaction.guild_id??interaction.channel_id);
        let playerCard = await generatePlayerCard(player, guild.forbidden);
        await interactionThunk(interaction, client, {embeds:[playerCard]});
    },
};


module.exports = command;