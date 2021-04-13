const { getTeam } = require("../../util/teamUtils");
const {summaries} = require("../../schemas/subscription");
const { Permissions } = require("discord.js");
const { permShift, interactionRespond } = require("../../util/interactionUtils");
// const { messageError } = require("../util/miscUtils");



const command = {
    action: "summaries",
    async execute(interaction, client) {

        if(interaction.guild_id){
            let permissions = new Permissions(permShift(interaction.member.permissions));
            if(!permissions.has("MANAGE_CHANNELS")) return interactionRespond(interaction, client, {ephemeral:true, content:"You require the manage channel permission to run this command!"});
        }

        let team = await getTeam(interaction.data.options[0].options[0].value);

        let err, docs = await summaries.find({guild_id:interaction.guild_id??interaction.channel_id, team:team.id});
        if(err) throw err;
        if(docs.length == 0) return interactionRespond(interaction, client,{content:`You are not subscibed to this teams summaries! Use \`/subscribe summaries ${team.fullName}\` to do so!`, ephemeral:true});

        // eslint-disable-next-line no-unused-vars
        let savErr, doc = await summaries.deleteOne({
            channel_id: interaction.channel_id,
            guild_id: interaction.guild_id??interaction.channel_id,
            team: team.id
        });
        if(savErr) throw savErr;
        return interactionRespond(interaction, client, {content:`Unsubscribed this channel from the ${team.nickname}'s game summaries!`});
    },
};

module.exports = command;