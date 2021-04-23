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

/**
 * Waits for response
 * @param {Interaction} interaction
 * @param {Client} client
 * @param {Boolean} ephemeral
 * @returns {void}
 */
function interactionThink (interaction, client, ephemeral) {

    client.api.interactions(interaction.id, interaction.token).callback.post({
        "data": {
            "type": 5,
            "data": {
                "flags": ephemeral ? 64 : null
            }
        }
    });

}

/**
 * Sends a thonk message
 * @param {Interaction} interaction
 * @param {Client} client
 * @param {Options} options
 * @returns {messages}
 */
async function interactionThunk (interaction, client, options) {

    const application = await client.application;


    return client.api.webhooks(application.id, interaction.token).messages["@original"].patch({
        "data": {
            "content": options.content ?? null,
            "embeds": options.embeds ?? null
        }
    });

}

/**
 * Simply fixes perms from the api
 * @param {bitfield} bitfield
 * @returns {bitfield}
 */
function permShift (bitfield) {

    return BigInt(bitfield);

}

module.exports = {
    interactionRespond,
    permShift,
    interactionThink,
    interactionThunk
};
