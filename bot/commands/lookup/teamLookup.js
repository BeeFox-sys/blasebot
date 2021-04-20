const {getTeam, generateTeamCard} = require("../../util/teamUtils");
const {getGuild} = require("../../util/guildUtils");
const {interactionThunk} = require("../../util/interactionUtils");

const command = {
    "action": "team",
    async execute (interaction, client) {

        const team = await getTeam(interaction.data.options[0].options[0].value);
        const guild = await getGuild(interaction.guild_id ?? interaction.channel_id);
        const teamCard = await generateTeamCard(team, true || guild.forbidden);

        await interactionThunk(
            interaction, client,
            {
                "content": Number(team.emoji) ? String.fromCodePoint(team.emoji) : team.emoji,
                "embeds": [teamCard]
            }
        );
    
    }
};

module.exports = command;
