const { Permissions } = require("discord.js");
const {eventsCol} = require("../../schemas/subscription");
const { permShift, interactionRespond } = require("../../util/interactionUtils");

const command = {
    action: "events",
    async execute(interaction, client) {

        if(interaction.guild_id){
            let permissions = new Permissions(permShift(interaction.member.permissions));
            if(!permissions.has("MANAGE_CHANNELS")) return interactionRespond(interaction, client, {ephemeral:true, content:"You require the manage channel permission to run this command!"});
        }

        let err, docs = await eventsCol.find({guild_id: interaction.guild_id, channel_id: interaction.channel_id});
        if(err) throw err;
        if(docs.length > 0) return interactionRespond(interaction, client, {ephemeral:true, content:"There is already an event channel! use `/unsubscribe events` to remove it!"});

        // eslint-disable-next-line no-unused-vars
        let savErr, doc = new eventsCol({
            channel_id: interaction.channel_id,
            guild_id: interaction.guild_id??interaction.channel_id
        }).save();
        if(savErr) throw savErr;
        return interactionRespond(interaction, client, {content:"Subscribed this channel to outcomes for all games!"});
    },
};

module.exports = command;