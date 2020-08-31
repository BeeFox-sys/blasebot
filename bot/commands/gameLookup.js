const { getGames, getGameByID } = require("../blaseball-api/game");
const { getTeam } = require("../util/teamUtils");
const { generateGameCard } = require("../util/gameUtils");
const command = {
    name: "game",
    aliases: [],
    description: "Lookup a game by season, day, and team!\nbb!game [season] [day] [team]\n*Postseason is days 100+ of the previous season*",
    async execute(message, args) {
        if(args.length == 1){
            let game = await getGameByID(args[0]);
            if(!game) return message.channel.send("That game doesn't exist!");  
            let gameCard = await generateGameCard(game);
            await message.channel.send(gameCard);          
            return;
        }
        if(args.length < 3) return message.channel.send("You must specify a season, day, and team!");
        let season = args.shift()-1;
        let day = args.shift()-1;
        let teamName = args.join(" ");
        let team = await getTeam(teamName);
        if(!team) return message.channel.send("I can't find that team!");
        let games = await getGames(season,day);
        let game = games.filter(g=> (g.awayTeam == team.id || g.homeTeam == team.id))[0];
        if(!game) return message.channel.send("That game doesn't exist!");
        let gameCard = await generateGameCard(game);
        await message.channel.send(gameCard);
    },
};

module.exports = command;

//https://www.blaseball.com/database/games?season=3&day=68