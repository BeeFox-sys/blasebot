const {betReminders} = require("../../schemas/subscription");
const {interactionRespond, permShift} = require("../../util/interactionUtils");
const {Permissions} = require("discord.js");

const command = {
    "action": "bets",
    async execute (interaction, client) {

        if (interaction.guild_id) {

            const permissions = new Permissions(permShift(interaction.member.permissions));

            if (!permissions.has("MANAGE_CHANNELS")) {

                interactionRespond(interaction, client, {"ephemeral": true,
                    "content": "You require the manage channel permission to run this command!"});
                
                return;

            }
        
        }

        const bet = await betReminders.findOne({"channel_id": interaction.channel_id});

        if (bet) {
            
            await betReminders.deleteOne({
                "channel_id": interaction.channel_id
            });

            
            interactionRespond(
                interaction, client,
                {"content": "Disabled bet reminders in this channel!"}
            );
            
            return;
        
        }

        interactionRespond(
            interaction, client,
            {"ephemeral": true,
                // eslint-disable-next-line max-len
                "content": "You are not reciving bet reminders here! Use `/subscribe bets` to get them!"}
        );
    
    }
};

module.exports = command;
