
const client = global.client;
const EventSource = require("eventsource");
const { generateGameCard } = require("./util/gameUtils");
const { updateStreamData } = require("./blaseball-api/game");

console.log("Subscribing to stream data...");
var source = new EventSource(client.config.apiUrlEvents+"/streamData");
source.on("message",(message)=>{
    let data = JSON.parse(message.data).value;
    updateStreamData(data);
    if(data.games) broadcastGames(data.games.schedule);

});
source.once("open", (event)=>{
    console.log("Subscribed to event stream!");
});
source.on("error",(error)=>console.error);

const {subscriptions, summaries, scores} = require("./schemas/subscription");
const NodeCache = require("node-cache");

const gameCache = new NodeCache({stdTTL:5400,checkperiod:3600});

async function broadcastGames(games){
    if(!client.readyAt) return; //Prevent attempting to send messages before connected to discord
    for (const game of games) {
        //play by play        
        if(game.gameComplete && !(gameCache.get(game.id)?.gameComplete === false)) continue;
        if(!game.gameStart) continue;

        let err, docs = await subscriptions.find({$or:[{ team:game.homeTeam},{team:game.awayTeam}]});
        if(err) throw err;
        if(docs.length == 0) continue;

        let play = generatePlay(game);
        
        if(game.gameComplete && gameCache.get(game.id)?.gameComplete == false){
            let winner;
            if(game.homeScore>game.awayScore) winner = game.homeTeamNickname;
            else winner = game.awayTeamNickname;
            play = `**Game Over**\n> **${game.homeTeamNickname} v ${game.awayTeamNickname} Season __${game.season+1}__ Day __${game.day+1}__**\n> Game ${game.seriesIndex} of ${game.seriesLength}\`\n> ${winner} wins!\n> ${String.fromCodePoint(game.homeTeamEmoji)}: ${game.homeScore} | ${String.fromCodePoint(game.awayTeamEmoji)}: ${game.awayScore}`;
        }

        if(!play) continue;

        for (const subscription of docs) {
            client.channels.fetch(subscription.channel_id).then(c=>c.send(play).catch(console.error));
        }
    }
    for(const game of games){
        //Summaries
        let lastupdate = gameCache.get(game.id);
        if(!lastupdate) continue;
        if(lastupdate.gameComplete == false && game.gameComplete == true){
            console.log(game.id," finished!");
            let summary = await generateGameCard(game);
            let err, docs = await summaries.find({$or:[{team:game.homeTeam},{team:game.awayTeam}]});
            if(err) throw err;
            if(docs.length == 0) continue;
            for (const summarySubscription of docs) {
                if(summarySubscription.team == game.awayTeam && docs.find(d=>d.team==game.homeTeam&&d.channel_id==summarySubscription.channel_id)) continue;
                client.channels.fetch(summarySubscription.channel_id).then(c=>c.send(`${game.homeTeamName} v. ${game.awayTeamName} Game ${game.seriesIndex} of ${game.seriesLength} finished!`,summary)).catch(console.error);
            }
        }
    }
    for(const game of games){
        //Score recap
        let lastUpdate = gameCache.get(game.id);
        if(!lastUpdate) continue;
        if(lastUpdate.homeScore != game.homeScore || lastUpdate.awayScore != game.awayScore){
            let err, docs = await scores.find({$or:[{team:game.homeTeam},{team:game.awayTeam}]});
            if(err) throw err;
            if(docs.length == 0) continue;
            for (const scoreSubscription of docs) {
                if(scoreSubscription.team == game.awayTeam && docs.find(d=>d.team==game.homeTeam&&d.channel_id==scoreSubscription.channel_id)) continue; //anti double posting
                let hometeamscore;
                if(lastUpdate.homeScore != game.homeScore) hometeamscore = true;
                if(lastUpdate.awayScore != game.awayScore) hometeamscore = false;
                client.channels.fetch(scoreSubscription.channel_id).then(c=>c.send(`**__${game.homeTeamName}__ v. __${game.awayTeamName}__, Game ${game.seriesIndex} of ${game.seriesLength} update!**\n${game.topOfInning?"Top":"Bottom"} of ${game.inning+1}\n${String.fromCodePoint(game.homeTeamEmoji)} ${hometeamscore?"**":""}${game.homeTeamNickname}${hometeamscore?"**":""}: ${game.homeScore}\n${String.fromCodePoint(game.awayTeamEmoji)} ${!hometeamscore?"**":""}${game.awayTeamNickname}${!hometeamscore?"**":""}: ${game.awayScore}\n> ${game.lastUpdate}`)).catch(console.error);
            }
        }
    }
    for(const game of games){
        gameCache.set(game.id, game);        
    }
}

const lastPlay = new NodeCache({stdTTL:60, checkperiod:300});
const { Weather } = require("./util/gameUtils");

function generatePlay(game){

    let lastupdate = gameCache.get(game.id);

    let play = "";

    if(!lastupdate) play += `> **${game.homeTeamNickname} v ${game.awayTeamNickname} Season __${game.season+1}__ Day __${game.day+1}__**\n> Game ${game.seriesIndex} of ${game.seriesLength}\n> Weather: ${Weather[game.weather]}\n`;

    if(!lastupdate || lastupdate.homeScore != game.homeScore || lastupdate.awayScore != game.awayScore) play += `> ${String.fromCodePoint(game.homeTeamEmoji)}: ${game.homeScore} | ${String.fromCodePoint(game.awayTeamEmoji)}: ${game.awayScore}\n`;

    play += `${game.lastUpdate}`;

    if(game.lastUpdate == lastPlay.get(game.id)) return;

    lastPlay.set(game.id, game.lastUpdate);

    return play;
}