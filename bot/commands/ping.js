const { interactionRespond } = require("../util/interactionUtils");

const command = {
    action: "ping",
    async execute(interaction, client){
        interactionRespond(interaction, client, {content: "🏓 Pong!"});
    }
};

module.exports = command;