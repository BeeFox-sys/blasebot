const {Permissions} = require("discord.js");
const {interactionRespond} = require("../util/interactionUtils");

const command = {
    "action": "info",
    async execute (interaction, client) {

        return interactionRespond(interaction, client, {
            "ephemeral": true,
            // eslint-disable-next-line max-len
            "content": `Invite to your server: ${client.generateInvite({
                "permissions": [
                    Permissions.FLAGS.SEND_MESSAGES,
                    Permissions.FLAGS.VIEW_CHANNEL,
                    Permissions.FLAGS.EMBED_LINKS,
                    2147483648n // USE_SLASH_COMMANDS
                ],
                "additionalScopes": ["applications.commands"]
            // eslint-disable-next-line max-len
            })}\nContribute on github: https://github.com/BeeFox-sys/blasebot\nHelp keep blasebot running: https://www.patreon.com/beefox\n\nFun fact! You can subscribe to things in your DMs or any channel you have manage channel permissions for!`
        });
    
    }
};

module.exports = command;
