/**
 *
 * @param {Interaction} interaction
 * @param {Client} client
 * @param {Object} options
 * @param {Boolean} options.ephemeral
 * @param {MessageEmbed[]} options.embeds
 * @param {String} options.content
 * @return {promise}
 */
function interactionRespond (interaction, client, options) {

    return client.api.interactions(interaction.id, interaction.token).callback.post({
        "data": {
            "type": 4,
            "data": {
                "content": options.content ?? null,
                "embeds": options.embeds ?? null,
                "flags": options.ephemeral ? 64 : null
            }
        }
    });

}

function interactionThink (interaction, client, ephemeral) {

    return client.api.interactions(interaction.id, interaction.token).callback.post({
        "data": {
            "type": 5,
            "data": {
                "flags": ephemeral ? 64 : null
            }
        }
    });

}

async function interactionThunk (interaction, client, options) {

    const application = await client.fetchApplication();


    return client.api.webhooks(application.id, interaction.token).messages["@original"].patch({
        "data": {
            "content": options.content ?? null,
            "embeds": options.embeds ?? null
        }
    });

}

function permShift (bitfield) {

    return bitfield >>> 1;

}

module.exports = {
    interactionRespond,
    permShift,
    interactionThink,
    interactionThunk
};
