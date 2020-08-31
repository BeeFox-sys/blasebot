const { getTeam, generateTeamCard } = require("../util/teamUtils");
const { getGuild } = require("../util/guildUtils");

const command = {
    name: "team",
    aliases: [],
    description: "Looks up a team\nbb!team [team name]",
    async execute(message, args) {
        let teamName = args.join(" ");
        let team = await getTeam(teamName);
        if(!team) return message.channel.send("I couldn't find that team!");
        let forbidden;
        if(message.guild){
            let guild = await getGuild(message.guild.id);
            forbidden = guild.forbidden;
        } else {
            forbidden = false;
        }        let teamCard = await generateTeamCard(team, forbidden);
        await message.channel.send(String.fromCodePoint(team.emoji), teamCard);
    },
};

module.exports = command;