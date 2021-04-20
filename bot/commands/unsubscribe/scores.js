const {getTeam} = require("../../util/teamUtils");
const {"compacts": Compacts} = require("../../schemas/subscription");
const {permShift, interactionRespond} = require("../../util/interactionUtils");
const {Permissions} = require("discord.js");

const command = {
    "action": "scores",
    async execute (interaction, client) {

        if (interaction.guild_id) {

            const permissions = new Permissions(permShift(interaction.member.permissions));

            if (!permissions.has("MANAGE_CHANNELS")) {

                interactionRespond(interaction, client, {"ephemeral": true,
                    "content": "You require the manage channel permission to run this command!"});
                
                return;

            }
        
        }
        
        const team = await getTeam(interaction.data.options[0].options[0].value);
        const docs = await Compacts.find({"$or": [
            {"channel_id": interaction.channel_id},
            {"guild_id": interaction.guild_id ?? interaction.channel_id,
                "team": interaction.data.options[0].options[0].value}
        ]});

        if (docs.length === 0) {

            interactionRespond(
                interaction, client,
                {"ephemeral": true,
                // eslint-disable-next-line max-len
                    "content": `You are not subscibed to this teams score updates! Use \`/subscribe scores ${team.fullName}\` to get score updates!`}
            );
            
            return;

        }

        await Compacts.deleteOne({
            "channel_id": interaction.channel_id,
            "guild_id": interaction.guild_id ?? interaction.channel_id,
            "team": interaction.data.options[0].options[0].value
        });

        interactionRespond(
            interaction, client,
            {"content": `Unsubscribed this channel from the ${team.fullName}'s score updates!`}
        );

    }
};

module.exports = command;
