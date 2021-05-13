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

        const docs = await EventsCol.find({
            "channel_id": interaction.channel_id
        });

        if (docs.length === 0) {

            interactionRespond(
                interaction, client,
                {"ephemeral": true,
                    // eslint-disable-next-line max-len
                    "content": "This is not an event channel! Use `/subscribe events` to make it one!"}
            );
            
            return;

        }

        await EventsCol.deleteOne({
            "channel_id": interaction.channel_id,
            "guild_id": interaction.guild_id ?? interaction.channel_id
        });
        
        interactionRespond(
            interaction, client,
            {"content": "Unsubscribed this channel from outcomes for all games!"}
        );
    
    }
};

module.exports = command;
