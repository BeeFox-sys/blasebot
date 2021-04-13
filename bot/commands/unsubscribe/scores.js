const { getTeam } = require("../../util/teamUtils");
const {compacts} = require("../../schemas/subscription");
const {permShift, interactionRespond} = require("../../util/interactionUtils");
const {Permissions} = require("discord.js");

const command = {
    action: "scores",
    async execute(interaction, client) {

        if(interaction.guild_id){
            let permissions = new Permissions(permShift(interaction.member.permissions));
            if(!permissions.has("MANAGE_CHANNELS")) return interactionRespond(interaction, client, {ephemeral:true, content:"You require the manage channel permission to run this command!"});
        }
        
        let team = await getTeam(interaction.data.options[0].options[0].value);
        let err, docs = await compacts.find({$or: [{channel_id: interaction.channel_id},{guild_id:interaction.guild_id??interaction.channel_id, team:interaction.data.options[0].options[0].value}]});
        if(err) throw err;
        if(docs.length == 0) return interactionRespond(interaction, client, {ephemeral:true, content:`You are not subscibed to this teams score updates! Use \`/subscribe scores ${team.fullName}\` to get score updates!`});

        // eslint-disable-next-line no-unused-vars
        let savErr, doc = await compacts.deleteOne({
            channel_id: interaction.channel_id,
            guild_id: interaction.guild_id??interaction.channel_id,
            team: interaction.data.options[0].options[0].value
        });
        if(savErr) throw savErr;
        return interactionRespond(interaction, client, {content:`Unsubscribed this channel from the ${team.fullName}'s score updates!`});

    },
};

module.exports = command;