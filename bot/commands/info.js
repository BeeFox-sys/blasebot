// 
const { messageError } = require("../util/miscUtils");

const command = {
    name: "info",
    aliases: [],
    description: "Invite and git links\nbb!info",
    root: false,
    async execute(message, args) {
        message.channel.send("Invite to server: <https://discord.com/oauth2/authorize?client_id=749154634370646067&scope=bot&permissions=18432>\nContribute on github: <https://github.com/BeeFox-sys/blasebot>").then(global.stats.messageFreq.mark()).catch(messageError);
    },
};

module.exports = command;