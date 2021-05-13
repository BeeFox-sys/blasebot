const {getTeam} = require("../../util/teamUtils");
const {summaries} = require("../../schemas/subscription");
const {Permissions} = require("discord.js");
const {permShift, interactionRespond} = require("../../util/interactionUtils");
// Const { messageError } = require("../util/miscUtils");


const command = {
    "action": "summaries",
    async execute (interaction, client) {

        if (interaction.guild_id) {

            const permissions = new Permissions(permShift(interaction.member.permissions));

            if (!permissions.has("MANAGE_CHANNELS")) {

                interactionRespond(interaction, client, {"ephemeral": true,
                    "content": "You require the manage channel permission to run this command!"});
                
                return;

            }
        
        }

        const team = await getTeam(interaction.data.options[0].options[0].value);

        const docs
        = await summaries.find({
            "channel_id": interaction.channel_id,
            "team": team.id
        });

        if (docs.length === 0) {

            interactionRespond(
                interaction, client,
                // eslint-disable-next-line max-len
                {"content": `You are not subscibed to this teams summaries! Use \`/subscribe summaries ${team.fullName}\` to do so!`,
                    "ephemeral": true}
            );
            
            return;

        }

        await summaries.deleteOne({
            "channel_id": interaction.channel_id,
            "guild_id": interaction.guild_id ?? interaction.channel_id,
            "team": team.id
        });
        
        interactionRespond(
            interaction, client,
            {"content": `Unsubscribed this channel from the ${team.nickname}'s game summaries!`}
        );
    
    }
};

module.exports = command;
