const { getTeam, generateTeamCard } = require("../util/teamUtils");

const command = {
    name: "team",
    aliases: [],
    description: "Looks up a team\nbb!team [team name]",
    async execute(message, args) {
        let teamName = args.join(" ");
        let team = await getTeam(teamName);
        if(!team) return message.channel.send("I couldn't find that team!");
        let teamCard = await generateTeamCard(team);
        await message.channel.send(String.fromCodePoint(team.emoji), teamCard);
    },
};

module.exports = command;