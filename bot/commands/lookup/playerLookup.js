const {generatePlayerCard} = require("../../util/playerUtils");
const {getPlayer} = require("../../blaseball-api/players");
const {getGuild} = require("../../util/guildUtils");
const {interactionThunk} = require("../../util/interactionUtils");

const command = {
    "action": "player",
    async execute (interaction, client) {

        const playerName = interaction.data.options[0].options[0].value;
        const player = await getPlayer(playerName);

        if (!player) {

            interactionThunk(
                interaction, client,
                {"content": `I couldn't find player ${playerName}!`}
            );

            return;

        }
        const guild = await getGuild(interaction.guild_id ?? interaction.channel_id);
        const playerCard = await generatePlayerCard(player, guild.forbidden || false);

        await interactionThunk(interaction, client, {"embeds": [playerCard]});
    
    }
};


module.exports = command;
