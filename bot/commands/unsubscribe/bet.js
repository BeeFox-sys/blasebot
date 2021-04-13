const { betReminders } = require("../../schemas/subscription");
const { interactionRespond, permShift } = require("../../util/interactionUtils");
const { Permissions } = require("discord.js");

const command = {
    action: "bets",
    async execute(interaction, client) {
        if(interaction.guild_id){
            let permissions = new Permissions(permShift(interaction.member.permissions));
            if(!permissions.has("MANAGE_CHANNELS")) return interactionRespond(interaction, client, {ephemeral:true, content:"You require the manage channel permission to run this command!"});
        }

        let bet = await betReminders.findOne({channel_id:interaction.channel_id});
        if(bet){
            
            // eslint-disable-next-line no-unused-vars
            let err, bet = await betReminders.deleteOne({
                channel_id:interaction.channel_id
            });
            if(err) throw err;
            return interactionRespond(interaction,client,{content:"Disabled bet reminders in this channel!"});
        }

        interactionRespond(interaction, client, {ephemeral:true, content:"You are not reciving bet reminders here! Use `/subscribe bets` to get them!"});
    },
};

module.exports = command;