const {"betReminders": BetReminders} = require("../../schemas/subscription");
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

        let bet = await BetReminders.findOne({"channel_id": interaction.channel_id});

        if (!bet) {

            bet = new BetReminders({
                "channel_id": interaction.channel_id
            });
            await bet.save();
            
            interactionRespond(
                interaction, client,
                {"content": "Enabled bet reminders in this channel!"}
            );
            
            return;
        
        }

        interactionRespond(interaction, client, {"ephemeral": true,
            "content": "You are already reciving bet reminders here"});
    
    }
};

module.exports = command;
