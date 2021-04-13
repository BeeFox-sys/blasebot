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
        if(!bet){
            bet = new betReminders({
                channel_id:interaction.channel_id
            });
            // eslint-disable-next-line no-unused-vars
            let err, save = await bet.save();
            if(err) throw err;
            return interactionRespond(interaction,client,{content:"Enabled bet reminders in this channel!"});
        }

        interactionRespond(interaction, client, {ephemeral:false, content:"You are already reciving bet reminders here"});
    },
};

module.exports = command;