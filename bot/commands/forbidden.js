const {getGuild, saveGuild} = require("../util/guildUtils");
const { messageError } = require("../util/miscUtils");

const command = {
    name: "forbidden",
    aliases: [],
    description: "Toggles if forbidden knowledge is disabled in this guild\nDefault: Hide forbidden knowlage\nbb!subscribe [team name]",
    root: false,
    async execute(message, args) {

        if(message.guild && !message.channel.permissionsFor(message.member).has("MANAGE_GUILD")) return message.channel.send("You require the manage server permission to run this command!").then(global.stats.messageFreq.mark()).catch(messageError);

        let guild = await getGuild(message.guild?.id??message.channel.id);

        let current = guild?.forbidden ?? false;

        guild.forbidden = !current;
        guild = await saveGuild(guild);

        return await message.channel.send(`Now ${guild.forbidden?"showing":"hiding"} forbidden knowledge in this guild!`).then(global.stats.messageFreq.mark()).catch(messageError);


    },
};

module.exports = command;