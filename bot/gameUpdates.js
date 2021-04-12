const client = global.client;
// const EventSource = require("eventsource");
const {generateGameCard} = require("./util/gameUtils");
// const {updateStreamData, DataStreamCache} = require("./blaseball-api/game");

// console.log("Subscribing to stream data...");
// var source = new EventSource(client.config.apiUrlEvents + "/streamData", {withCredentials: true});
// let lastUpdateData;
// source.on("message", (message) => {
//     let data = JSON.parse(message.data).value;
//     if (lastUpdateData == data) 
//         return;
    
//     lastUpdateData = data;
//     updateStreamData(data);
//     broadcast();
// });
// source.once("open", (event) => {
//     console.log("Subscribed to event stream!");
// });
// source.on("error", (error) => console.error);

const {
    subscriptions,
    summaries,
    scores,
    betReminders,
    compacts,
    eventsCol
} = require("./schemas/subscription");
// const NodeCache = require("node-cache");

// const gameCache = new NodeCache({
//     stdTTL: 60 * 60
// });

// async function broadcast() {
//     global.stats.gameEvents.mark();
//     if (! client.readyAt) 
//         return;
//     // Prevent attempting to send messages before connected to discord

//     let gameData = DataStreamCache.get("games");

//     let games = gameData.schedule;

//     // if(games?.length)for (const game of games) {
//     //     //play by play
//     //
//     // !!! IMPLEMENT WEBHOOKS FOR PLAY BY PLAY !!!
//     //
//     //     if(game.gameComplete && !(gameCache.get(game.id)?.gameComplete === false)) continue;
//     //     if(!game.gameStart) continue;

//     //     try{
//     //         let err, docs = await subscriptions.find({$or:[{ team:game.homeTeam},{team:game.awayTeam}]}).then(global.stats.dbQueryFreq.mark());
//     //         if(err) throw err;
//     //         if(docs.length == 0) continue;

//     //         let play = generatePlay(game);

//     //         if(playCounter.get(game.id) == undefined){
//     //             playCounter.set(game.id, 0);
//     //             if(!play) continue;
//     //             playCache.set(game.id, play);
//     //             continue;
//     //         }
//     //         else if(game.lastUpdate == "Game Over."){
//     //             //Continue with code
//     //         }
//     //         else if(playCounter.get(game.id) < 1){
//     //             playCounter.set(game.id, playCounter.get(game.id)+1);
//     //             if(!play) continue;
//     //             playCache.set(game.id, playCache.get(game.id)+play);
//     //             continue;
//     //         }


//     //         if(!playCache.get(game.id)) continue;
//     //         play = playCache.get(game.id);
//     //         for (const subscription of docs) {
//     //             client.channels.fetch(subscription.channel_id).then(c=>c.send(play).then(global.stats.messageFreq.mark()).catch(messageError));
//     //         }
//     //         playCache.del(game.id);
//     //         playCounter.del(game.id);
//     //     }
//     //     catch(e){console.error(e); continue;}
//     // }
    

//     // console.log(gameCache.keys());
//     let oldGames = Object.values(gameCache.mget(gameCache.keys()));
//     if (games?.every(g=>g.gameComplete) && oldGames.every(g=>g.gameComplete === false)) {
        
//         if (games.length){
//             for (const game of games) {
//                 gameCache.set(game.id, game);
//             }
//         }
//     }
// }

const {events, sim, games} = require("blaseball");

// -- Temporal --

events.on("rawTemporal",(temporal)=>{
    if (temporal.doc.epsilon) screenTakeover(temporal);
});

async function screenTakeover(temporal){
    let speak = {};

    switch (temporal.doc.gamma) {
    case 0: speak = {
        name: "The Shelled One",
        colour: "#FF0000",
        url: "https://game-icons.net/icons/ffffff/000000/1x1/rihlsul/peanut.png"
    };
        break;
    case 1: speak = {
        name: "The Monitor",
        colour: "#5988ff",
        url: "https://game-icons.net/icons/ffffff/000000/1x1/delapouite/giant-squid.png"
    };
        break;
    case 2: speak = {
        name: "Boss",
        colour: "#ffbe00",
        url: "https://d35iw2jmbg6ut8.cloudfront.net/static/media/Equity.c533a2ae.png"
    };
        break;
    case 3: speak = {
        name: "Tarot Draw",
        colour: "#a16dc3",
        url: ""
    };
        break;
    case 4: speak = {
        name: "Lōotcrates",
        colour: "#707070",
        url: "https://ik.imagekit.io/beefox/blaseball/Lootcrates.png"
    };
        break;
    default: speak = {
        name: "???",
        colour: "#666666",
        url: ""
    };
    }

    let speakMessage = new MessageEmbed().setTitle(temporal.doc.zeta).setColor(speak.colour).setAuthor(speak.name, speak.url, "https://blaseball.com");
    // if(bossFights.length > 0)speakMessage.setFooter(`Season [${sim().season+1}] Day [X]`);
    let err,
        docs = await eventsCol.find({});
    if (err) 
        throw err;
    
    for (const doc of docs) {
        const channel = await client.channels.fetch(doc.channel_id);
        channel.send(speakMessage).then(global.stats.messageFreq.mark()).catch(messageError);
    }
}

// --- Game Updates ---
//Outcomes
events.on("gameUpdate",async (newGame, oldGame)=>{
    try{
        if(!oldGame || newGame.gameComplete) return;
        let outcomes = handleEvents(newGame, oldGame.outcomes.length);
        if (!outcomes.length) return;
        
        let err,docs = await eventsCol.find({});
        if (err) throw err;

        for (const doc of docs) {
            const channel = await client.channels.fetch(doc.channel_id).catch((e) => {
                messageError(e);
            });
            if (! channel) return;
            for (const outcome of outcomes) {
                channel.send(outcome).then(global.stats.messageFreq.mark()).catch(messageError);
            }
        }
    } catch (e) {
        console.error(e);
    }
});
// Compact Scores
events.on("gameUpdate",async (newGame,oldGame)=>{
    if(!oldGame || newGame.gameComplete) return;
    if (oldGame.homeScore != newGame.homeScore || oldGame.awayScore != newGame.awayScore) {
        try {
            let err,
                docs = await compacts.find({
                    $or: [
                        {
                            team: newGame.homeTeam
                        }, {
                            team: newGame.awayTeam
                        }
                    ]
                }).then(global.stats.dbQueryFreq.mark());
            if (err) 
                throw err;
            
            if (docs.length == 0) 
                return;
            
            for (const compactSubscription of docs) {
                if (compactSubscription.team == newGame.awayTeam && docs.find(d => d.team == newGame.homeTeam && d.channel_id == compactSubscription.channel_id)) 
                    continue;
                // anti double posting
                let hometeamscore;
                if (oldGame.homeScore != newGame.homeScore) 
                    hometeamscore = true;
                
                if (oldGame.awayScore != newGame.awayScore) 
                    hometeamscore = false;
                
                client.channels.fetch(compactSubscription.channel_id).then(c => c.send(`**${
                    newGame.topOfInning ? "Top" : "Bottom"
                } of ${
                    newGame.inning + 1
                }** | ${
                    Number(newGame.awayTeamEmoji)?String.fromCodePoint(newGame.awayTeamEmoji):newGame.awayTeamEmoji
                } ${
                    ! hometeamscore ? "**" : ""
                }${
                    newGame.awayScore
                }${
                    ! hometeamscore ? "**" : ""
                } ${
                    Number(newGame.homeTeamEmoji)?String.fromCodePoint(newGame.homeTeamEmoji):newGame.homeTeamEmoji
                } ${
                    hometeamscore ? "**" : ""
                }${
                    newGame.homeScore
                }${
                    hometeamscore ? "**" : ""
                }\n>>> ${
                    newGame.lastUpdate
                }\n\`${
                    newGame.scoreUpdate
                }\``).then(global.stats.messageFreq.mark())).catch(messageError);
            }
        } catch (e) {
            console.error(e);
            return;
        }
    }
});
// -- Post Game --
// Summary
events.on("gameComplete",async (game)=>{
    try{
        let summary = await generateGameCard(game);
        let err,
            docs = await summaries.find({
                $or: [
                    {
                        team: game.homeTeam
                    }, {
                        team: game.awayTeam
                    }
                ]
            }).then(global.stats.dbQueryFreq.mark());
        if (err) 
            throw err;
                    
        if (docs.length == 0) 
            return;
                    
        for (const summarySubscription of docs) {
            if (summarySubscription.team == game.awayTeam && docs.find(d => d.team == game.homeTeam && d.channel_id == summarySubscription.channel_id)) 
                continue;
                        
            client.channels.fetch(summarySubscription.channel_id).then(c => c.send(`${
                game.awayTeamName
            } v. ${
                game.homeTeamName
            } Game ${
                game.seriesIndex
            } of ${
                game.seriesLength
            } finished!`, summary).then(global.stats.messageFreq.mark())).catch(messageError);
        }
    } catch (e) {
        console.error(e);
        return;
    }
});
//Bet
events.on("gamesFinished",async (todaySchedule, tomorrowSchedule)=>{
    console.log("All games finished!");
    try {
        // eslint-disable-next-line no-unused-vars
        let err, docs = await betReminders.find({}).then(global.stats.dbQueryFreq.mark()).catch(console.error);
        let oddsEmbed;
        if(tomorrowSchedule.length == 0) await new Promise(resolve => setTimeout(resolve, 30000));
        tomorrowSchedule = games().tomorrowSchedule;
        if (tomorrowSchedule.length > 0) {
            oddsEmbed = new MessageEmbed().setTitle(`Season ${
                sim().season + 1
            } Day ${
                sim().day + 2
            } Odds:`);
            for (const game of tomorrowSchedule) {
                let underlineHome = Math.round(game.awayOdds * 100) < Math.round(game.homeOdds * 100);
                oddsEmbed.addField(
                    `${Number(game.awayTeamEmoji)?String.fromCodePoint(game.awayTeamEmoji):game.awayTeamEmoji} v. ${Number(game.homeTeamEmoji)?String.fromCodePoint(game.homeTeamEmoji):game.homeTeamEmoji}`,
                    `${! underlineHome ? "__" : ""}**${Math.round(game.awayOdds * 100)}%**${!underlineHome ? "__" : ""} | ${underlineHome ? "__" : ""}**${Math.round(game.homeOdds * 100)}%**${underlineHome ? "__" : ""}`, 
                    true
                );
            }
        }
        for (const channel of docs) {
            client.channels.fetch(channel.channel_id).then(c => c.send(`All Season ${
                sim().season + 1
            } Day ${
                sim().day + 1
            } Games Complete!${
                tomorrowSchedule.length ? " Go Bet!" : " Go catch up on some sleep!"
            }`, oddsEmbed).then(global.stats.messageFreq.mark())).catch(messageError);
        }
    } catch (e) {
        console.error(e);
    }
});



// // const lastPlay = new NodeCache({stdTTL: 60, checkperiod: 300});
// const {Weather} = require("./util/gameUtils");
const {messageError} = require("./util/miscUtils");
const {MessageEmbed} = require("discord.js");

// function generatePlay(game) {

//     let lastUpdate = gameCache.get(game.id);

//     if (game.lastUpdate == lastPlay.get(game.id)) 
//         return;
    


//     let play = "";


//     if (! lastUpdate) 
//         play += `> **${
//             game.awayTeamNickname
//         } v ${
//             game.homeTeamNickname
//         } Season __${
//             game.season + 1
//         }__ Day __${
//             game.day + 1
//         }__**\n> Game ${
//             game.seriesIndex
//         } of ${
//             game.seriesLength
//         }\n> Weather: ${
//             Weather[game.weather]
//         }\n`;
    

//     if (! lastUpdate || lastUpdate.homeScore != game.homeScore || lastUpdate.awayScore != game.awayScore) 
//         play += `> ${
//             Number(game.awayTeamEmoji)?String.fromCodePoint(game.awayTeamEmoji):game.awayTeamEmoji
//         }: ${
//             game.awayScore
//         } | ${
//             Number(game.homeTeamEmoji)?String.fromCodePoint(game.homeTeamEmoji):game.homeTeamEmoji
//         }: ${
//             game.homeScore
//         }\n`;
    

//     play += `${
//         game.lastUpdate
//     }\n`;

//     if (lastUpdate && lastUpdate.baserunnerCount < game.baserunnerCount) {
//         play += `${
//             game.baserunnerCount
//         } bases loaded.\n`;
//     }

//     if (lastUpdate && lastUpdate.halfInningOuts < game.halfInningOuts) {
//         play += `${
//             game.halfInningOuts
//         } outs.\n`;
//     }

//     if (! lastUpdate || lastUpdate.inning<game.inning || game.topOfInning != lastUpdate.topOfInning){
//         play += `${game.topOfInning?game.homePitcherName:game.awayPitcherName} pitching.\n`;
//     }

//     lastPlay.set(game.id, game.lastUpdate);

//     return play;
// }

const eventTypes = [
    {id: "REVERB", name: "Reverb", colour: "#61b3ff", search: /reverb|repeat/i},
    {id: "FEEDBACK", name: "Feedback", colour: "#ff007b", search: /flicker|feedback/i},
    {id: "INCINERATION", name: "Incineration", colour: "#fefefe", search: /rogue umpire/i},
    {id: "PEANUT", name: "Peanut", colour: "#c4aa70", search: /stray peanut/i},
    {id: "BLOOD DRAIN", name: "Blooddrain", colour: "#ff1f3c", search: /blooddrain/i},
    {id: "BIRD", name: "Birds", colour: "#8e5fad", search: /birds/i},
    {id: "BLACKHOLE", name: "Black Hole", colour: "#00374a", search: /black hole/i},
    {id: "SUN2", name: "Sun 2", colour: "#fdff9c", search: /sun 2/i},

    {id: "UNSTABLE", name: "Unstable", colour: "#eaabff", search: /unstable|instability /i},
    {id: "PARTY", name: "Party Time", colour: "#ff66f9", search: /party/i},
    {id: "REDHOT", name: "Red Hot", colour: "#e32600", search: /red hot/i},
    {id: "PERCOLATED", name: "Percolated", colour: "#96afd4", search: /percolated/i},
    {id: "HONEYROASTED", name: "Shelled", colour: "#ffda75", search: /tasted the infinite/i},
    {id: "ELSEWHERE", name: "Elsewhere", colour: "#bdb3c3", search: /elsewhere/i},
    {id: "CONSUMERS", name: "CONSUMERS", colour: "#c80c0c", search: /consumers/i},
    {id: "ECHO", name: "Echo", colour: "#9c2c46", search: /echo/i},
    {id: "OBSERVED", name: "Observed", colour: "#9a7b4f", search: /observed/i},
    {id: "SUNDIALED", name: "Sun Dialed", colour: "#ffe100", search: /catches some rays/i},

    {id: "SHAME", name: "SHAME", colour: "#800878", search: /shame/i},
    {id: "UNKNOWN", name: "Unknown Event", colour: "#010101"}
];

function handleEvents(game, index){
    let events = [];
    for (let i = index; i < game.outcomes.length; i++) {
        const outcome = game.outcomes[i];
        let type;
        for (const eventType of eventTypes) {
            if(eventType.search?.test(outcome)){
                type = eventType;
            }
        }
        if(!type) type = eventTypes.find(e=>e.id=="UNKNOWN");
        events.push({
            id: game.id, eventType: type, flavor: outcome
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
client.on("channelDelete", channel => {
    let id = channel.id;
    scores.deleteMany({channel_id: id}).catch(console.error);
    subscriptions.deleteMany({channel_id: id}).catch(console.error);
    summaries.deleteMany({channel_id: id}).catch(console.error);
    betReminders.deleteMany({channel_id: id}).catch(console.error);
    compacts.deleteMany({channel_id: id}).catch(console.error);
    eventsCol.deleteMany({channel_id: id}).catch(console.error);
});