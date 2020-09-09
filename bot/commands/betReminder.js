const { betReminders } = require("../schemas/subscription");
const { messageError } = require("../util/miscUtils");

const command = {
    name: "subscribe bet",
    aliases: ["unsubscribe bet"],
    description: "Toggles bet reminders for this channel\nbb!subscribe bet",
    root: false,
    async execute(message, args) {

        if(message.guild && !message.channel.permissionsFor(message.member).has("MANAGE_CHANNELS")) return message.channel.send("You require the manage channel permission to run this command!").then(global.stats.messageFreq.mark()).catch(messageError);


        let bet = await betReminders.findOne({channel_id:message.channel.id});
        if(!bet){
            bet = new betReminders({
                channel_id:message.channel.id
            });
            // eslint-disable-next-line no-unused-vars
            let err, save = await bet.save();
            if(err) throw err;
            return message.channel.send("Enabled bet reminders in this channel!").then(global.stats.messageFreq.mark()).catch(messageError);
        }

        // eslint-disable-next-line no-unused-vars
        let err, del = bet.deleteOne();
        if(err) throw err;
        return message.channel.send("Disabled bet reminders in this channel").then(global.stats.messageFreq.mark()).catch(messageError);
    },
};

module.exports = command;