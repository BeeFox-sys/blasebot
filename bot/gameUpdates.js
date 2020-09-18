
const client = global.client;
const EventSource = require("eventsource");
const { generateGameCard } = require("./util/gameUtils");
const { updateStreamData, DataStreamCache } = require("./blaseball-api/game");

console.log("Subscribing to stream data...");
var source = new EventSource(client.config.apiUrlEvents+"/streamData", { withCredentials: true });
source.on("message",(message)=>{
    let data = JSON.parse(message.data).value;
    updateStreamData(data);
    if(data.games) broadcastGames(data.games);

});
source.once("open", (event)=>{
    console.log("Subscribed to event stream!");
});
source.on("error",(error)=>console.error);

const {subscriptions, summaries, scores, betReminders, compacts, eventsCol} = require("./schemas/subscription");
const NodeCache = require("node-cache");

const gameCache = new NodeCache({stdTTL:5400,checkperiod:3600});
const peanutCache = new NodeCache({stdTTL:5400,checkperiod:3600});

async function broadcastGames(gameData){
    global.stats.gameEvents.mark();
    if(!client.readyAt) return; //Prevent attempting to send messages before connected to discord
    

    let games = gameData.schedule;
    let tomorrowSchedule = gameData.tomorrowSchedule;

    if(games?.length)for (const game of games) {
        //play by play    
        if(game.gameComplete && !(gameCache.get(game.id)?.gameComplete === false)) continue;
        if(!game.gameStart) continue;

        try{
            let err, docs = await subscriptions.find({$or:[{ team:game.homeTeam},{team:game.awayTeam}]}).then(global.stats.dbQueryFreq.mark());
            if(err) throw err;
            if(docs.length == 0) continue;

            let play = generatePlay(game);
        
            if(game.gameComplete && gameCache.get(game.id)?.gameComplete == false){
                let winner;
                if(game.homeScore>game.awayScore) winner = game.homeTeamNickname;
                else winner = game.awayTeamNickname;
                play = `**Game Over**\n> **${game.awayTeamNickname} v ${game.homeTeamNickname} Season __${game.season+1}__ Day __${game.day+1}__**\n> Game ${game.seriesIndex} of ${game.seriesLength}\n> ${winner} wins!\n> ${String.fromCodePoint(game.awayTeamEmoji)}: ${game.awayScore} | ${String.fromCodePoint(game.homeTeamEmoji)}: ${game.homeScore}`;
            }

            if(!play) continue;

            for (const subscription of docs) {
                client.channels.fetch(subscription.channel_id).then(c=>c.send(play).then(global.stats.messageFreq.mark()).catch(messageError));
            }
        }
        catch(e){console.error(e); continue;}
    }
    if(games?.length)for(const game of games){
        let lastupdate = gameCache.get(game.id);
        if(!lastupdate) continue;
        if(!(!lastupdate.gameComplete && game.gameComplete)) continue;
        //Outcomes
        try{
            let outcomes = handleEvents(game);
            if(!outcomes.length) continue;
            let err, docs = await eventsCol.find({});
            if(err) throw err;
            for(const doc of docs){
                const channel = await client.channels.fetch(doc.channel_id);
                for (const outcome of outcomes){
                    channel.send(outcome).then(global.stats.messageFreq.mark()).catch(messageError);
                }
                
            }
        }
        catch(e){console.error(e); continue;}
    }
    if(games?.length)for(const game of games){
        //Summaries
        let lastupdate = gameCache.get(game.id);
        if(!lastupdate) continue;
        if(lastupdate.gameComplete == false && game.gameComplete == true){
            try{
                console.log(game.id," finished!");
                let summary = await generateGameCard(game);
                let err, docs = await summaries.find({$or:[{team:game.homeTeam},{team:game.awayTeam}]}).then(global.stats.dbQueryFreq.mark());
                if(err) throw err;
                if(docs.length == 0) continue;
                for (const summarySubscription of docs) {
                    if(summarySubscription.team == game.awayTeam && docs.find(d=>d.team==game.homeTeam&&d.channel_id==summarySubscription.channel_id)) continue;
                    client.channels.fetch(summarySubscription.channel_id).then(c=>c.send(`${game.awayTeamName} v. ${game.homeTeamName} Game ${game.seriesIndex} of ${game.seriesLength} finished!`,summary).then(global.stats.messageFreq.mark())).catch(messageError);
                }
            }
            catch(e){console.error(e); continue;}
        }
        
    }
    if(games?.length)for(const game of games){
        //Score recap
        let lastUpdate = gameCache.get(game.id);
        if(!lastUpdate) continue;
        if(lastUpdate.homeScore != game.homeScore || lastUpdate.awayScore != game.awayScore){
            try{
                let err, docs = await scores.find({$or:[{team:game.homeTeam},{team:game.awayTeam}]}).then(global.stats.dbQueryFreq.mark());
                if(err) throw err;
                if(docs.length == 0) continue;
                for (const scoreSubscription of docs) {
                    if(scoreSubscription.team == game.awayTeam && docs.find(d=>d.team==game.homeTeam&&d.channel_id==scoreSubscription.channel_id)) continue; //anti double posting
                    let hometeamscore;
                    if(lastUpdate.homeScore != game.homeScore) hometeamscore = true;
                    if(lastUpdate.awayScore != game.awayScore) hometeamscore = false;
                    client.channels.fetch(scoreSubscription.channel_id).then(c=>c.send(`**__${game.awayTeamName}__ v. __${game.homeTeamName}__\nSeason ${gameData.sim.season+1} Day ${gameData.sim.day+1}, Game ${game.seriesIndex} of ${game.seriesLength} update!**\n${game.topOfInning?"Top":"Bottom"} of ${game.inning+1}\n${String.fromCodePoint(game.awayTeamEmoji)} ${!hometeamscore?"**":""}${game.awayTeamNickname}${!hometeamscore?"**":""}: ${game.awayScore}\n${String.fromCodePoint(game.homeTeamEmoji)} ${hometeamscore?"**":""}${game.homeTeamNickname}${hometeamscore?"**":""}: ${game.homeScore}\n> ${game.lastUpdate}`).then(global.stats.messageFreq.mark())).catch(messageError);
                }
            }
            catch(e){console.error(e); continue;}
        }
    }
    if(games?.length)for(const game of games){
        //Compact score recap
        let lastUpdate = gameCache.get(game.id);
        if(!lastUpdate) continue;
        if(lastUpdate.homeScore != game.homeScore || lastUpdate.awayScore != game.awayScore){
            try{
                let err, docs = await compacts.find({$or:[{team:game.homeTeam},{team:game.awayTeam}]}).then(global.stats.dbQueryFreq.mark());
                if(err) throw err;
                if(docs.length == 0) continue;
                for (const compactSubscription of docs) {
                    if(compactSubscription.team == game.awayTeam && docs.find(d=>d.team==game.homeTeam&&d.channel_id==compactSubscription.channel_id)) continue; //anti double posting
                    let hometeamscore;
                    if(lastUpdate.homeScore != game.homeScore) hometeamscore = true;
                    if(lastUpdate.awayScore != game.awayScore) hometeamscore = false;
                    client.channels.fetch(compactSubscription.channel_id).then(c=>c.send(`**${game.topOfInning?"Top":"Bottom"} of ${game.inning+1}** | ${String.fromCodePoint(game.awayTeamEmoji)} ${!hometeamscore?"**":""}${game.awayScore}${!hometeamscore?"**":""} ${String.fromCodePoint(game.homeTeamEmoji)} ${hometeamscore?"**":""}${game.homeScore}${hometeamscore?"**":""}\n> ${game.lastUpdate}`).then(global.stats.messageFreq.mark())).catch(messageError);
                }
            }
            catch(e){console.error(e); continue;}
        }
    }

    let temporal = await DataStreamCache.get("temporal");
    temporal.doc.epsilon = true;
    temporal.doc.gamma = 1;
    let lastPeanut = await peanutCache.get("peanut");
    
    if(temporal.doc.epsilon && temporal.doc.zeta != lastPeanut?.zeta && temporal.doc.gamma != -1){
        //peanut is speaking

        let speak = {};

        if(temporal.doc.gamma == 0){
            speak = {
                name: "Peanut",
                colour: "#dc3545",
                url: "https://game-icons.net/icons/ffffff/000000/1x1/rihlsul/peanut.png"
            };
        }
        else if (temporal.doc.gamma == 1){
            speak = {
                name: "Squid",
                colour: "#007bff",
                url: "https://game-icons.net/icons/ffffff/000000/1x1/delapouite/giant-squid.png"
            };
        }

        let speakMessage = new MessageEmbed()
            .setTitle(temporal.doc.zeta)
            .setColor(speak.colour)
            .setAuthor(speak.name,speak.url,"https://blaseball.com");
        let err, docs = await eventsCol.find({});
        if(err) throw err;
        for(const doc of docs){
            const channel = await client.channels.fetch(doc.channel_id);
            channel.send(speakMessage).then(global.stats.messageFreq.mark()).catch(messageError);            
        }
        peanutCache.set("peanut",temporal.doc);
    }

    if(Object.values(games).every(game=>game.gameComplete) === true && Object.values(gameCache.mget(gameCache.keys())).every(game=>game.gameComplete) === false){
        console.log("All games finished!");
        try{
            // eslint-disable-next-line no-unused-vars
            let err, docs = await betReminders.find({}).then(global.stats.dbQueryFreq.mark()).catch(console.error);
            let oddsEmbed;
            if(tomorrowSchedule.length > 0){
                oddsEmbed = new MessageEmbed()
                    .setTitle(`Season ${gameData.sim.season+1} Day ${gameData.sim.day+1} Odds:`);
                for(const game of tomorrowSchedule){
                    let underlineHome = Math.round(game.awayOdds*100) < Math.round(game.homeOdds*100);
                    oddsEmbed.addField(`${String.fromCodePoint(game.awayTeamEmoji)} v. ${String.fromCodePoint(game.homeTeamEmoji)}`, `${!underlineHome?"__":""}**${Math.round(game.awayOdds*100)}%**${!underlineHome?"__":""} | ${underlineHome?"__":""}**${Math.round(game.homeOdds*100)}%**${underlineHome?"__":""}`,true);
                }
            }
            for(const channel of docs){
                client.channels.fetch(channel.channel_id).then(c=>c.send(`All Season ${gameData.sim.season+1} Day ${gameData.sim.day+1} Games Complete!${tomorrowSchedule?" Go Bet!":" Go catch up on some sleep!"}`,oddsEmbed).then(global.stats.messageFreq.mark())).catch(messageError);
            }
        }
        catch(e){console.error(e);}
    }
    if(games?.length)for(const game of games){
        gameCache.set(game.id, game);        
    }
}

const lastPlay = new NodeCache({stdTTL:60, checkperiod:300});
const { Weather } = require("./util/gameUtils");
const { messageError } = require("./util/miscUtils");
const { MessageEmbed } = require("discord.js");

function generatePlay(game){

    let lastUpdate = gameCache.get(game.id);

    if(game.lastUpdate == lastPlay.get(game.id)) return;


    let play = "";


    if(!lastUpdate) play += `> **${game.awayTeamNickname} v ${game.homeTeamNickname} Season __${game.season+1}__ Day __${game.day+1}__**\n> Game ${game.seriesIndex} of ${game.seriesLength}\n> Weather: ${Weather[game.weather]}\n`;

    if(!lastUpdate || lastUpdate.homeScore != game.homeScore || lastUpdate.awayScore != game.awayScore) play += `> ${String.fromCodePoint(game.awayTeamEmoji)}: ${game.awayScore} | ${String.fromCodePoint(game.homeTeamEmoji)}: ${game.homeScore}\n`;

    play += `${game.lastUpdate}\n`;

    if(lastUpdate && lastUpdate.baserunnerCount < game.baserunnerCount){
        play += `${game.baserunnerCount} bases\n`;
    }

    if(lastUpdate && lastUpdate.halfInningOuts < game.halfInningOuts){
        play += `${game.halfInningOuts} outs\n`;
    }

    if(!lastUpdate || lastUpdate.inning < game.inning || game.topOfInning != lastUpdate.topOfInning){
        play += `${game.topOfInning?game.homePitcherName:game.awayPitcherName} pitching.`;
    }

    lastPlay.set(game.id, game.lastUpdate);

    return play;
}

const eventTypes = [
    {id: "REVERB", name: "Reverb", colour:"#62b2ff", search: /reverb/i},//
    {id: "FEEDBACK", name: "Feedback", colour:"#ff017b", search: /flicker|feedback/i},//
    {id: "INCINERATION", name: "Incineration", colour:"#fefefe", search: /rogue umpire/i},
    {id: "PEANUT", name: "Peaunt", colour:"#fffd85", search: /peanut/i},
    {id: "BLOOD DRAIN", name:"Blooddrain", colour:"#ff1f3c", search: /blooddrain/i},//
    {id: "SHAME",name:"SHAME",colour:"#800878",search: /shame/i},
    {id: "UNSTABLE", name:"Unstable",colour:"#eaabff",search: /unstable|instability /i},
    {id: "BIRD", name:"Bird", colour:"#8e5fad",search: /birds/i},
    {id: "PARTY", name:"Party Time", colour:"#ff66f9", search: /party/i},
    {id: "UNKNOWN", name: "Unknown Event", colour:"#010101"} 
];

function handleEvents(game){
    let events = [];
    for(const outcome of game.outcomes){
        let type;
        for (const eventType of eventTypes) {
            if(eventType.search?.test(outcome)){
                type = eventType;
            }
        }
        if(!type) type = eventTypes.find(e=>e.id=="UNKNOWN");
        events.push({
            id: game.id,
            eventType: type,
            flavor: outcome
        });
    }
    let embeds = [];
    for(const event of events){
        let embed = new MessageEmbed()
            .setTitle(event.flavor)
            .setColor(event.eventType.colour)
            .setFooter(`${game.awayTeamNickname} vs ${game.homeTeamNickname}\nSeason ${game.season+1} Day ${game.day+1}`);
        embeds.push(embed);
    }
    return embeds;
}

//Handle channel deletions
client.on("channelDelete", channel =>{
    let id = channel.id;
    scores.deleteMany({channel_id:id}).catch(console.error);
    subscriptions.deleteMany({channel_id:id}).catch(console.error);
    summaries.deleteMany({channel_id:id}).catch(console.error);
    betReminders.deleteMany({channel_id:id}).catch(console.error);
    compacts.deleteMany({channel_id:id}).catch(console.error);
    eventsCol.deleteMany({channel_id:id}).catch(console.error);
});