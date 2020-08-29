const {getTeam} = require("../util/teamUtils");
const { MessageEmbed } = require("discord.js");

const command = {
    name: "team",
    aliases: [],
    description: "Looks up a team\nbb!team [team name]",
    async execute(message, args) {
        let teamName = args.join(" ");
        let team = await getTeam(teamName);
        if(!team) return message.channel.send("I couldn't find that team!");
        let teamCard = new MessageEmbed()
            .setTitle(String.fromCodePoint(team.emoji) + " " + team.fullName)
            .setColor(team.mainColor)
            .addField("Championships",team.championships)
            .addField("** **","** **")
            .addField("Been Shamed",team.totalShames, true)
            .addField("Shamed Others",team.totalShamings,true)
            .addField("** **","** **")
            .addField("Been Shamed This Season", team.seasonShames, true)
            .addField("Shamed Others This Season", team.seasonShamings,true)
            .setFooter(team.slogan);
        message.channel.send(String.fromCodePoint(team.emoji), teamCard);
    },
};

module.exports = command;