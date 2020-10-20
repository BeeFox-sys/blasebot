const client = global.client;
const EventSource = require("eventsource");
const {generateGameCard} = require("./util/gameUtils");
const {updateStreamData, DataStreamCache} = require("./blaseball-api/game");

console.log("Subscribing to stream data...");
var source = new EventSource(client.config.apiUrlEvents + "/streamData", {withCredentials: true});
let lastUpdateData;
source.on("message", (message) => {
    let data = JSON.parse(message.data).value;
    if (lastUpdateData == data) 
        return;
    
    lastUpdateData = data;
    updateStreamData(data);
    broadcast();
});
source.once("open", (event) => {
    console.log("Subscribed to event stream!");
});
source.on("error", (error) => console.error);

const {
    subscriptions,
    summaries,
    scores,
    betReminders,
    compacts,
    eventsCol
} = require("./schemas/subscription");
const NodeCache = require("node-cache");

const gameCache = new NodeCache({
    stdTTL: 60 * 60
});
const peanutCache = new NodeCache();
const playCache = new NodeCache({stdTTL: 600});
const playCounter = new NodeCache({stdTTL: 600});

async function broadcast() {
    global.stats.gameEvents.mark();
    if (! client.readyAt) 
        return;
    // Prevent attempting to send messages before connected to discord

    let gameData = DataStreamCache.get("games");

    let games = gameData.schedule;
    let tomorrowSchedule = gameData.tomorrowSchedule;

    // if(games?.length)for (const game of games) {
    //     //play by play
    //
    // !!! IMPLEMENT WEBHOOKS FOR PLAY BY PLAY !!!
    //
    //     if(game.gameComplete && !(gameCache.get(game.id)?.gameComplete === false)) continue;
    //     if(!game.gameStart) continue;

    //     try{
    //         let err, docs = await subscriptions.find({$or:[{ team:game.homeTeam},{team:game.awayTeam}]}).then(global.stats.dbQueryFreq.mark());
    //         if(err) throw err;
    //         if(docs.length == 0) continue;

    //         let play = generatePlay(game);

    //         if(playCounter.get(game.id) == undefined){
    //             playCounter.set(game.id, 0);
    //             if(!play) continue;
    //             playCache.set(game.id, play);
    //             continue;
    //         }
    //         else if(game.lastUpdate == "Game Over."){
    //             //Continue with code
    //         }
    //         else if(playCounter.get(game.id) < 1){
    //             playCounter.set(game.id, playCounter.get(game.id)+1);
    //             if(!play) continue;
    //             playCache.set(game.id, playCache.get(game.id)+play);
    //             continue;
    //         }


    //         if(!playCache.get(game.id)) continue;
    //         play = playCache.get(game.id);
    //         for (const subscription of docs) {
    //             client.channels.fetch(subscription.channel_id).then(c=>c.send(play).then(global.stats.messageFreq.mark()).catch(messageError));
    //         }
    //         playCache.del(game.id);
    //         playCounter.del(game.id);
    //     }
    //     catch(e){console.error(e); continue;}
    // }
    if (games?.length) 
        for (const game of games) {
            let lastupdate = gameCache.get(game.id);
            if (! lastupdate) 
                continue;
            
            // if(game.outcomes.length == 0) game.outcomes.push("Grey Alvarado is Partying!");
            if (lastupdate.outcomes.length == game.outcomes.length) 
                continue;
            
            // Outcomes
            try {
                // console.log(game);
                let outcomes = handleEvents(game, lastupdate.outcomes.length);
                if (! outcomes.length) 
                    continue;
                
                let err,
                    docs = await eventsCol.find({});
                if (err) 
                    throw err;
                
                for (const doc of docs) {
                    const channel = await client.channels.fetch(doc.channel_id).catch((e) => {
                        messageError(e);
                    });
                    if (! channel) 
                        continue;
                    
                    for (const outcome of outcomes) {
                        channel.send(outcome).then(global.stats.messageFreq.mark()).catch(messageError);
                    }

                }
            } catch (e) {
                console.error(e);
                continue;
            }
        }
    
    if (games?.length) 
        for (const game of games) {
            // Summaries
            let lastupdate = gameCache.get(game.id);
            if (! lastupdate) 
                continue;
            
            if (lastupdate.gameComplete == false && game.gameComplete == true) {
                try {
                    console.log(game.id, " finished!");
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
                        continue;
                    
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
                    continue;
                }
            }

        }
    
    if (games?.length) 
        for (const game of games) {
            // Score recap
            let lastUpdate = gameCache.get(game.id);
            if (! lastUpdate) 
                continue;
            
            if (lastUpdate.homeScore != game.homeScore || lastUpdate.awayScore != game.awayScore) {
                try {
                    let err,
                        docs = await scores.find({
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
                        continue;
                    
                    for (const scoreSubscription of docs) {
                        if (scoreSubscription.team == game.awayTeam && docs.find(d => d.team == game.homeTeam && d.channel_id == scoreSubscription.channel_id)) 
                            continue;
                        // anti double posting
                        let hometeamscore;
                        if (lastUpdate.homeScore != game.homeScore) 
                            hometeamscore = true;
                        
                        if (lastUpdate.awayScore != game.awayScore) 
                            hometeamscore = false;
                        
                        client.channels.fetch(scoreSubscription.channel_id).then(c => c.send(`**__${
                            game.awayTeamName
                        }__ v. __${
                            game.homeTeamName
                        }__\nSeason ${
                            gameData.sim.season + 1
                        } Day ${
                            gameData.sim.day + 1
                        }, Game ${
                            game.seriesIndex
                        } of ${
                            game.seriesLength
                        } update!**\n${
                            game.topOfInning ? "Top" : "Bottom"
                        } of ${
                            game.inning + 1
                        }\n${
                            Number(game.awayTeamEmoji)?String.fromCodePoint(game.awayTeamEmoji):game.awayTeamEmoji
                        } ${
                            ! hometeamscore ? "**" : ""
                        }${
                            game.awayTeamNickname
                        }${
                            ! hometeamscore ? "**" : ""
                        }: ${
                            game.awayScore
                        }\n${
                            Number(game.homeTeamEmoji)?String.fromCodePoint(game.homeTeamEmoji):game.awayTeamEmoji
                        } ${
                            hometeamscore ? "**" : ""
                        }${
                            game.homeTeamNickname
                        }${
                            hometeamscore ? "**" : ""
                        }: ${
                            game.homeScore
                        }\n> ${
                            game.lastUpdate
                        }`).then(global.stats.messageFreq.mark())).catch(messageError);
                    }
                } catch (e) {
                    console.error(e);
                    continue;
                }
            }
        }
    
    if (games?.length) 
        for (const game of games) {
            // Compact score recap
            let lastUpdate = gameCache.get(game.id);
            if (! lastUpdate) 
                continue;
            
            if (lastUpdate.homeScore != game.homeScore || lastUpdate.awayScore != game.awayScore) {
                try {
                    let err,
                        docs = await compacts.find({
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
                        continue;
                    
                    for (const compactSubscription of docs) {
                        if (compactSubscription.team == game.awayTeam && docs.find(d => d.team == game.homeTeam && d.channel_id == compactSubscription.channel_id)) 
                            continue;
                        // anti double posting
                        let hometeamscore;
                        if (lastUpdate.homeScore != game.homeScore) 
                            hometeamscore = true;
                        
                        if (lastUpdate.awayScore != game.awayScore) 
                            hometeamscore = false;
                        
                        client.channels.fetch(compactSubscription.channel_id).then(c => c.send(`**${
                            game.topOfInning ? "Top" : "Bottom"
                        } of ${
                            game.inning + 1
                        }** | ${
                            Number(game.awayTeamEmoji)?String.fromCodePoint(game.awayTeamEmoji):game.awayTeamEmoji
                        } ${
                            ! hometeamscore ? "**" : ""
                        }${
                            game.awayScore
                        }${
                            ! hometeamscore ? "**" : ""
                        } ${
                            Number(game.homeTeamEmoji)?String.fromCodePoint(game.homeTeamEmoji):game.homeTeamEmoji
                        } ${
                            hometeamscore ? "**" : ""
                        }${
                            game.homeScore
                        }${
                            hometeamscore ? "**" : ""
                        }\n> ${
                            game.lastUpdate
                        }`).then(global.stats.messageFreq.mark())).catch(messageError);
                    }
                } catch (e) {
                    console.error(e);
                    continue;
                }
            }
        }
    

    let temporal = await DataStreamCache.get("temporal");
    let bossFights = await DataStreamCache.get("fights").bossFights;
    // temporal.doc.gamma = 2;
    // temporal.doc.epsilon = true;
    // temporal.doc.zeta = "Some New Person";
    let lastPeanut = await peanutCache.get("peanut");

    if ((temporal.doc.epsilon || bossFights?.length > 0) && temporal.doc.zeta != lastPeanut?.zeta && temporal.doc.gamma != -1 && temporal.doc.zeta.length > 0) {
        
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
            url: "https://www.blaseball.com/static/media/Equity.7cde27ee.png"
        };
            break;
        default: speak = {
            name: "???",
            colour: "#666666",
            url: ""
        };

        }

        let speakMessage = new MessageEmbed().setTitle(temporal.doc.zeta).setColor(speak.colour).setAuthor(speak.name, speak.url, "https://blaseball.com");
        if(bossFights.length > 0)speakMessage.setFooter(`Season [${gameData.sim.season+1}] Day [X]`);
        let err,
            docs = await eventsCol.find({});
        if (err) 
            throw err;
        
        for (const doc of docs) {
            const channel = await client.channels.fetch(doc.channel_id);
            channel.send(speakMessage).then(global.stats.messageFreq.mark()).catch(messageError);
        }
    }
    peanutCache.set("peanut", temporal.doc);

    if (Object.values(games).every(game => game.gameComplete) === true && Object.values(gameCache.mget(gameCache.keys())).every(game => game.gameComplete) === false) {
        console.log("All games finished!");
        try {
            // eslint-disable-next-line no-unused-vars
            let err,
                docs = await betReminders.find({}).then(global.stats.dbQueryFreq.mark()).catch(console.error);
            let oddsEmbed;
            if (tomorrowSchedule.length > 0) {
                oddsEmbed = new MessageEmbed().setTitle(`Season ${
                    gameData.sim.season + 2
                } Day ${
                    gameData.sim.day + 2
                } Odds:`);
                for (const game of tomorrowSchedule) {
                    let underlineHome = Math.round(game.awayOdds * 100) < Math.round(game.homeOdds * 100);
                    oddsEmbed.addField(`${
                        Number(game.awayTeamEmoji)?String.fromCodePoint(game.awayTeamEmoji):game.awayTeamEmoji
                    } v. ${
                        Number(game.homeTeamEmoji)?String.fromCodePoint(game.homeTeamEmoji):game.homeTeamEmoji
                    }`,
                    `${
                        ! underlineHome ? "__" : ""
                    }**${
                        Math.round(game.awayOdds * 100)
                    }%**${
                        ! underlineHome ? "__" : ""
                    } | ${
                        underlineHome ? "__" : ""
                    }**${
                        Math.round(game.homeOdds * 100)
                    }%**${
                        underlineHome ? "__" : ""
                    }`, true);
                }
            }
            for (const channel of docs) {
                client.channels.fetch(channel.channel_id).then(c => c.send(`All Season ${
                    gameData.sim.season + 1
                } Day ${
                    gameData.sim.day + 1
                } Games Complete!${
                    tomorrowSchedule ? " Go Bet!" : " Go catch up on some sleep!"
                }`, oddsEmbed).then(global.stats.messageFreq.mark())).catch(messageError);
            }
        } catch (e) {
            console.error(e);
        }
    }
    if (games?.length) 
        for (const game of games) {
            gameCache.set(game.id, game);
        }
    
}

const lastPlay = new NodeCache({stdTTL: 60, checkperiod: 300});
const {Weather} = require("./util/gameUtils");
const {messageError} = require("./util/miscUtils");
const {MessageEmbed} = require("discord.js");

function generatePlay(game) {

    let lastUpdate = gameCache.get(game.id);

    if (game.lastUpdate == lastPlay.get(game.id)) 
        return;
    


    let play = "";


    if (! lastUpdate) 
        play += `> **${
            game.awayTeamNickname
        } v ${
            game.homeTeamNickname
        } Season __${
            game.season + 1
        }__ Day __${
            game.day + 1
        }__**\n> Game ${
            game.seriesIndex
        } of ${
            game.seriesLength
        }\n> Weather: ${
            Weather[game.weather]
        }\n`;
    

    if (! lastUpdate || lastUpdate.homeScore != game.homeScore || lastUpdate.awayScore != game.awayScore) 
        play += `> ${
            Number(game.awayTeamEmoji)?String.fromCodePoint(game.awayTeamEmoji):game.awayTeamEmoji
        }: ${
            game.awayScore
        } | ${
            Number(game.homeTeamEmoji)?String.fromCodePoint(game.homeTeamEmoji):game.homeTeamEmoji
        }: ${
            game.homeScore
        }\n`;
    

    play += `${
        game.lastUpdate
    }\n`;

    if (lastUpdate && lastUpdate.baserunnerCount < game.baserunnerCount) {
        play += `${
            game.baserunnerCount
        } bases loaded.\n`;
    }

    if (lastUpdate && lastUpdate.halfInningOuts < game.halfInningOuts) {
        play += `${
            game.halfInningOuts
        } outs.\n`;
    }

    if (! lastUpdate || lastUpdate.inning<game.inning || game.topOfInning != lastUpdate.topOfInning){
        play += `${game.topOfInning?game.homePitcherName:game.awayPitcherName} pitching.\n`;
    }

    lastPlay.set(game.id, game.lastUpdate);

    return play;
}

const eventTypes = [
    {id: "REVERB", name: "Reverb", colour:"#62b2ff", search: /reverb|repeat/i},
    {id: "FEEDBACK", name: "Feedback", colour:"#ff017b", search: /flicker|feedback/i},
    {id: "INCINERATION", name: "Incineration", colour:"#fefefe", search: /rogue umpire/i},
    {id: "PEANUT", name: "Peaunt", colour:"#fffd85", search: /peanut/i}, 
    {id: "BLOOD DRAIN", name:"Blooddrain", colour:"#ff1f3c", search: /blooddrain/i},
    {id: "SHAME", name:"SHAME", colour:"#800878", search: /shame/i},
    {id: "UNSTABLE", name:"Unstable", colour:"#eaabff", search: /unstable|instability /i}, 
    {id: "BIRD", name:"Bird", colour:"#8e5fad", search: /birds/i}, 
    {id: "PARTY", name:"Party Time", colour:"#ff66f9", search: /party/i}, 
    {id: "REDHOT", name:"Red Hot", colour:"#e32600", search: /red hot/i}, 
    {id: "BLACKHOLE", name:"Black Hole", colour:"#00374a", search: /black hole/i}, 
    {id: "SUN2", name:"Sun 2", colour:"#fdff9c", search: /sun 2/i}, 
    {id: "UNKNOWN", name: "Unknown Event", colour:"#010101"}
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
