const { getTeam, generateTeamCard } = require("../util/teamUtils");
const { getGuild } = require("../util/guildUtils");
const { messageError } = require("../util/miscUtils");

const command = {
    name: "team",
    aliases: [],
    description: "Looks up a team\nbb!team [team name]",
    root: false,
    async execute(message, args) {
        let teamName = args.join(" ");
        let team = await getTeam(teamName);
        if(!team || team.fullName == "Null Team") return message.channel.send("I couldn't find that team!").then(global.stats.messageFreq.mark()).catch(messageError);
        let guild = await getGuild(message.guild?.id??message.channel.id);
        let teamCard = await generateTeamCard(team, guild.forbidden);
        await message.channel.send(Number(team.emoji)?String.fromCodePoint(team.emoji):team.emoji, teamCard).then(global.stats.messageFreq.mark()).catch(messageError);
    },
};

module.exports = command;