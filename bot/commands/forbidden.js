const { Permissions } = require("discord.js");
const {getGuild, saveGuild} = require("../util/guildUtils");
const { permShift, interactionRespond } = require("../util/interactionUtils");

const command = {
    action: "forbidden-knowledge",
    async execute(interaction, client) {

        if(interaction.guild_id){
            let permissions = new Permissions(permShift(interaction.member.permissions));
            if(!permissions.has("MANAGE_GUILD")) return interactionRespond(interaction, client, {ephemeral:true, content:"You require the manage channel permission to run this command!"});
        }

        let enable = interaction.data.options?.[0].value??null;
        
        let guild = await getGuild(interaction.guild_id??interaction.channel_id);

        let current = guild?.forbidden ?? false;

        if(enable === null){
            return interactionRespond(interaction,client,{
                content:`Currently, blasebot ${current?"shows":"hides"} forbidden knowledge in this server!\nUse \`/forbidden-knowledge enable:${current?"false":"true"}\` to ${current?"hide":"show"} F    K`
            });
        }
        
        guild.forbidden = enable;
        guild = await saveGuild(guild);

        return await interactionRespond(interaction, client, {content:`Now ${guild.forbidden?"showing":"hiding"} forbidden knowledge in this guild!`});
    },
};

module.exports = command;