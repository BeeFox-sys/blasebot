
const client = global.client;
const EventSource = require("eventsource");
const { updateGameCache } = require("./util/gameUtils");

console.log("Subscribing to stream data...");
var source = new EventSource(client.config.apiUrlEvents+"/streamData");
source.on("message",(message)=>{
    let data = JSON.parse(message.data).value;
    updateGameCache(data);
    broadcastGames(data.games.schedule);
});
source.on("open", (event)=>{
    console.log("Subscribed to event stream!");
});
source.on("error",(error)=>console.error);

const subscriptions = require("./schemas/subscription");
const NodeCache = require("node-cache");


async function broadcastGames(games){
    if(!client.readyAt) return; //Prevent attempting to send messages before connected to discord
    for (const game of games) {

        if(game.gameComplete) continue;

        let err, docs = await subscriptions.find({$or:[{ team:game.homeTeam},{team:game.awayTeam}]});
        if(err) throw err;
        if(docs.length == 0) continue;

        let play = generatePlay(game);
        if(!play) continue;

        for (const subscription of docs) {
            client.channels.fetch(subscription.channel_id).then(c=>c.send(play));
        }
    }
}

const gameCache = new NodeCache({stdTTL:5400,checkperiod:3600});
const lastPlay = new NodeCache({stdTTL:60, checkperiod:300});
const { Weather } = require("./util/gameUtils");

function generatePlay(game){

    let lastupdate = gameCache.get(game.id);

    let play = "";

    if(!lastupdate) play += `> **${game.homeTeamNickname} v ${game.awayTeamNickname} Season __${game.season+1}__ Day __${game.day+1}__**\n> Weather: ${Weather[game.weather]}\n`;

    if(!lastupdate || lastupdate.homeScore != game.homeScore || lastupdate.awayScore != game.awayScore) play += `> ${String.fromCodePoint(game.homeTeamEmoji)}: ${game.homeScore} | ${String.fromCodePoint(game.awayTeamEmoji)}: ${game.awayScore}\n`;

    play += `${game.lastUpdate}`;

    if(game.lastUpdate == lastPlay.get(game.id)) return;

    gameCache.set(game.id, game);
    lastPlay.set(game.id, game.lastUpdate);

    return play;
}