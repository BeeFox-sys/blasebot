const { betReminders } = require("../schemas/subscription");
const { messageError } = require("../util/miscUtils");

const command = {
    name: "unsubscribe bet",
    aliases: [],
    description: "Disables bet reminders for this channel\nbb!unsubscribe bet",
    root: false,
    async execute(message, args) {

        if(message.guild && !message.channel.permissionsFor(message.member).has("MANAGE_CHANNELS")) return message.channel.send("You require the manage channel permission to run this command!").then(global.stats.messageFreq.mark()).catch(messageError);


        let bet = await betReminders.findOne({channel_id:message.channel.id});
        if(!bet){
            return message.channel.send("You are not reciving bet reminders here!");
        }

        // eslint-disable-next-line no-unused-vars
        let err, del = bet.deleteOne();
        if(err) throw err;
        return message.channel.send("Disabled bet reminders in this channel").then(global.stats.messageFreq.mark()).catch(messageError);
    },
};

module.exports = command;