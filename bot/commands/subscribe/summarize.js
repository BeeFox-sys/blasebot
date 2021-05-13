const {getTeam} = require("../../util/teamUtils");
const {"summaries": Summaries} = require("../../schemas/subscription");
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
         = await Summaries.find({"channel_id": interaction.channel_id,
             "team": team.id});

        if (docs.length > 0) {

            interactionRespond(
                interaction, client,
                // eslint-disable-next-line max-len
                {"content": "You already have subscibed to this teams summaries! use `/unsubscribe summaries` to remove the summaries",
                    "ephemeral": true}
            );
            
            return;

        }

        new Summaries({
            "channel_id": interaction.channel_id,
            "guild_id": interaction.guild_id ?? interaction.channel_id,
            "team": team.id
        }).save();
        
        interactionRespond(
            interaction, client,
            {"content": `Subscribed this channel to the ${team.nickname}'s game summaries!`}
        );
        
    
    }
};

module.exports = command;
