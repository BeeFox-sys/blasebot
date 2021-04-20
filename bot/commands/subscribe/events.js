const {Permissions} = require("discord.js");
const {"eventsCol": EventsCol} = require("../../schemas/subscription");
const {permShift, interactionRespond} = require("../../util/interactionUtils");

const command = {
    "action": "events",
    async execute (interaction, client) {

        if (interaction.guild_id) {

            const permissions = new Permissions(permShift(interaction.member.permissions));

            if (!permissions.has("MANAGE_CHANNELS")) {

                interactionRespond(interaction, client, {"ephemeral": true,
                    "content": "You require the manage channel permission to run this command!"});
                
                return;

            }
        
        }

        const docs = await EventsCol.find({"guild_id": interaction.guild_id,
            "channel_id": interaction.channel_id});

        if (docs.length > 0) {

            interactionRespond(
                interaction, client,
                {
                    "ephemeral": true,
                    "content":
                        "There is already an event channel! use `/unsubscribe events` to remove it!"
                }
            );
            
            return;

        }

        new EventsCol({
            "channel_id": interaction.channel_id,
            "guild_id": interaction.guild_id ?? interaction.channel_id
        }).save();
        
        interactionRespond(
            interaction, client,
            {"content": "Subscribed this channel to outcomes for all games!"}
        );
        
    
    }
};

module.exports = command;
