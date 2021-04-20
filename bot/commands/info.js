const {interactionRespond} = require("../util/interactionUtils");

const command = {
    "action": "info",
    async execute (interaction, client) {

        return interactionRespond(interaction, client, {
            "ephemeral": true,
            // eslint-disable-next-line max-len
            "content": "Invite to your server: https://discord.com/oauth2/authorize?client_id=749154634370646067&scope=bot&permissions=18432\nContribute on github: https://github.com/BeeFox-sys/blasebot\n\nFun fact! You can subscribe to things in your DMs or any channel you have manage channel permissions for!"
        });
    
    }
};

module.exports = command;
