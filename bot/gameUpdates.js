const {client} = global;
const {generateGameCard} = require("./util/gameUtils");

const {
    subscriptions,
    summaries,
    scores,
    betReminders,
    compacts,
    eventsCol
} = require("./schemas/subscription");

const {events, sim, games} = require("blaseball");

// -- Temporal --

events.on("rawTemporal", (temporal) => {

    if (temporal.doc.epsilon) {

        screenTakeover(temporal);

    }

});

const {MessageEmbed} = require("discord.js");
const {clearChannelData} = require("./util/miscUtils");

/**
 * Event for temporal Updates
 * @param {json} temporal - temporal object
 */
async function screenTakeover (temporal) {

    let speak = {};

    switch (temporal.doc.gamma) {

    case 0: speak = {
        "name": "The Shelled One",
        "colour": "#FF0000",
        "url": "https://game-icons.net/icons/ffffff/000000/1x1/rihlsul/peanut.png"
    };
        break;
    case 1: speak = {
        "name": "The Monitor",
        "colour": "#5988ff",
        "url": "https://game-icons.net/icons/ffffff/000000/1x1/delapouite/giant-squid.png"
    };
        break;
    case 2: speak = {
        "name": "Boss",
        "colour": "#ffbe00",
        "url": "https://d35iw2jmbg6ut8.cloudfront.net/static/media/Equity.c533a2ae.png"
    };
        break;
    case 3: speak = {
        "name": "Tarot Draw",
        "colour": "#a16dc3",
        "url": ""
    };
        break;
    case 4: speak = {
        "name": "The Microphone",
        "colour": "#c50c55",
        "url": "https://www.blaseball.wiki/images/8/88/Tgb_feedback.png"
    };
        break;
    case 5: speak = {
        "name": "Lōotcrates",
        "colour": "#707070",
        "url": "https://ik.imagekit.io/beefox/blaseball/Lootcrates.png"
    };
        break;
    default: speak = {
        "name": "???",
        "colour": "#666666",
        "url": ""
    };

    }

    const speakMessage = new MessageEmbed().setTitle(temporal.doc.zeta)
        .setColor(speak.colour)
        .setAuthor(speak.name, speak.url, "https://blaseball.com");
    // If(bossFights.length > 0)speakMessage.setFooter(`Season [${sim().season+1}] Day [X]`);
    const docs = await eventsCol.find({});

    for (const doc of docs) {

        const channel = await client.channels.fetch(doc.channel_id);

        channel.send(speakMessage)
            .catch((er) => {

                switch (er.code) {
                
                case 50001:
                case 50013: clearChannelData(channel.id);
                    break;
                
                default: console.error(er);
                
                }
            
            });

    }

}

/*
 *  --- Game Updates ---
 * Outcomes
 */

events.on("gameUpdate", async (newGame, oldGame) => {

    try {

        if (!oldGame || newGame.gameComplete) {

            return;

        }
        const outcomes = handleEvents(newGame, oldGame.outcomes.length);

        if (!outcomes.length) {

            return;

        }

        const docs = await eventsCol.find({});

        for (const doc of docs) {

            const channel = await client.channels.fetch(doc.channel_id).catch(console.error);

            if (!channel) {

                clearChannelData(doc.channel_id);
                continue;

            }
            for (const outcome of outcomes) {

                channel.send(outcome)
                    .catch((er) => {

                        switch (er.code) {
    
                        case 50001:
                        case 50013: clearChannelData(channel.id);
                            break;
                    
                        default: console.error(er);
                    
                        }
                
                    });

            }

        }

    } catch (err) {

        console.error(err);

    }

});
// Compact Scores
events.on("gameUpdate", async (newGame, oldGame) => {

    if (!oldGame || newGame.gameComplete) {

        return;

    }
    if (oldGame.homeScore !== newGame.homeScore || oldGame.awayScore !== newGame.awayScore) {

        try {

            const docs = await compacts.find({
                "$or": [
                    {
                        "team": newGame.homeTeam
                    },
                    {
                        "team": newGame.awayTeam
                    }
                ]
            });

            if (docs.length === 0) {

                return;

            }

            for (const compactSubscription of docs) {

                if (
                    compactSubscription.team === newGame.awayTeam
                    && docs.find((doc) => doc.team === newGame.homeTeam
                    && doc.channel_id === compactSubscription.channel_id)) {

                    continue;

                }
                // Anti double posting
                const hometeamscore = oldGame.homeScore !== newGame.homeScore;

                client.channels.fetch(compactSubscription.channel_id)
                    .then((channel) => channel.send(`**${
                        newGame.topOfInning
                            ? "Top"
                            : "Bottom"
                    } of ${
                        newGame.inning + 1
                    }** | ${
                        Number(newGame.awayTeamEmoji)
                            ? String.fromCodePoint(newGame.awayTeamEmoji)
                            : newGame.awayTeamEmoji
                    } ${
                        !hometeamscore ? "**" : ""
                    }${
                        newGame.awayScore
                    }${
                        !hometeamscore ? "**" : ""
                    } ${
                        Number(newGame.homeTeamEmoji)
                            ? String.fromCodePoint(newGame.homeTeamEmoji)
                            : newGame.homeTeamEmoji
                    } ${
                        hometeamscore ? "**" : ""
                    }${
                        newGame.homeScore
                    }${
                        hometeamscore ? "**" : ""
                    }\n>>> ${
                        newGame.lastUpdate
                    }${
                        newGame.scoreUpdate
                            ? `\n\`${newGame.scoreUpdate}\``
                            : ""
                    }`).catch((er) => {

                        switch (er.code) {
        
                        case 50001:
                        case 50013: clearChannelData(channel.id);
                            break;
                        
                        default: console.error(er);
                        
                        }
                    
                    }))
                    .catch(console.error);

            }

        } catch (err) {

            console.error(err);

        }

    }

});

/*
 * -- Post Game --
 * Summary
 */
events.on("gameComplete", async (game) => {

    try {

        const summary = await generateGameCard(game);
        const docs = await summaries.find({
            "$or": [
                {
                    "team": game.homeTeam
                },
                {
                    "team": game.awayTeam
                }
            ]
        });

        if (docs.length === 0) {

            return;

        }

        for (const summarySubscription of docs) {

            if (summarySubscription.team === game.awayTeam
                && docs.find((doc) => doc.team === game.homeTeam
                && doc.channel_id === summarySubscription.channel_id)) {

                continue;

            }

            client.channels.fetch(summarySubscription.channel_id).then((channel) => channel.send(`${
                game.awayTeamName
            } v. ${
                game.homeTeamName
            } Game ${
                game.seriesIndex
            } of ${
                game.seriesLength
            } finished!`, summary)
                .catch((er) => {

                    switch (er.code) {

                    case 50001:
                    case 50013: clearChannelData(channel.id);
                        break;
                
                    default: console.error(er);
                
                    }
            
                }))
                .catch(console.error);

        }

    } catch (error) {

        console.error(error);

    }

});
// Bet
events.on("gamesFinished", async (todaySchedule, tomorrowSched) => {

    console.log("All games finished!");
    try {

        const docs = await betReminders.find({})
            .catch(console.error);

        if (tomorrowSched.length === 0) {

            // eslint-disable-next-line no-promise-executor-return
            await new Promise((resolve) => setTimeout(resolve, 30000));

        }
        const {tomorrowSchedule} = games();

        const oddsEmbed = new MessageEmbed().setTitle(`Season ${
            sim().season + 1
        } Day ${
            sim().day + 2
        } Odds:`);

        if (tomorrowSchedule.length > 0) {

            for (const game of tomorrowSchedule) {

                const underlineHome
                = Math.round(game.awayOdds * 100) < Math.round(game.homeOdds * 100);

                oddsEmbed.addField(

                    `${
                        Number(game.awayTeamEmoji)
                            ? String.fromCodePoint(game.awayTeamEmoji)
                            : game.awayTeamEmoji
                    } v. ${
                        Number(game.homeTeamEmoji)
                            ? String.fromCodePoint(game.homeTeamEmoji)
                            : game.homeTeamEmoji
                    }`,

                    `${!underlineHome ? "__" : ""}**${
                        Math.round(game.awayOdds * 100)}%**${
                        !underlineHome ? "__" : ""} | ${
                        underlineHome ? "__" : ""}**${
                        Math.round(game.homeOdds * 100)}%**${underlineHome ? "__" : ""}`,
                    true
                );

            }

        }
        for (const channel of docs) {

            client.channels.fetch(channel.channel_id)
                .then((betchannel) => betchannel.send(`All Season ${
                    sim().season + 1
                } Day ${
                    sim().day + 1
                } Games Complete!${
                    tomorrowSchedule.length > 0
                        ? " Go Bet!"
                        : " Go catch up on some sleep!"
                }`, oddsEmbed)
                    .catch((er) => {

                        switch (er.code) {
    
                        case 50001:
                        case 50013: clearChannelData(betchannel.id);
                            break;
                    
                        default: console.error(er);
                    
                        }
                
                    }))
                .catch(console.error);

        }

    } catch (err) {

        console.error(err);

    }

});


const eventTypes = [
    {"id": "REVERB",
        "name": "Reverb",
        "colour": "#4d3171",
        "search": /reverb|repeat/iu},
    {"id": "FEEDBACK",
        "name": "Feedback",
        "colour": "#ff007b",
        "search": /flicker|feedback/iu},
    {"id": "INCINERATION",
        "name": "Incineration",
        "colour": "#fefefe",
        "search": /rogue umpire/iu},
    {"id": "PEANUT",
        "name": "Peanut",
        "colour": "#c4aa70",
        "search": /stray peanut/iu},
    {"id": "BLOOD DRAIN",
        "name": "Blooddrain",
        "colour": "#ff1f3c",
        "search": /blooddrain/iu},
    {"id": "BIRD",
        "name": "Birds",
        "colour": "#8e5fad",
        "search": /birds/iu},
    {"id": "BLACKHOLE",
        "name": "Black Hole",
        "colour": "#00374a",
        "search": /black hole/iu},
    {"id": "SUN2",
        "name": "Sun 2",
        "colour": "#fdff9c",
        "search": /sun 2/iu},
    {"id": "SALMON",
        "name": "Salmon",
        "colour": "#ba7b97",
        "search": /salmon/iu},
    {"id": "GLITTER",
        "name": "Glitter",
        "colour": "#ff94ff",
        "search": /gained/iu},

    {"id": "UNSTABLE",
        "name": "Unstable",
        "colour": "#eaabff",
        "search": /unstable|instability /iu},
    {"id": "PARTY",
        "name": "Party Time",
        "colour": "#ff66f9",
        "search": /party/iu},
    {"id": "REDHOT",
        "name": "Red Hot",
        "colour": "#e32600",
        "search": /red hot/iu},
    {"id": "PERCOLATED",
        "name": "Percolated",
        "colour": "#96afd4",
        "search": /percolated/iu},
    {"id": "HONEYROASTED",
        "name": "Shelled",
        "colour": "#ffda75",
        "search": /tasted the infinite/iu},
    {"id": "ELSEWHERE",
        "name": "Elsewhere",
        "colour": "#bdb3c3",
        "search": /elsewhere/iu},
    {"id": "ECHO",
        "name": "Echo",
        "colour": "#9c2c46",
        "search": /echo/iu},
    {"id": "OBSERVED",
        "name": "Observed",
        "colour": "#9a7b4f",
        "search": /observed/iu},
    {"id": "SUNDIALED",
        "name": "Sun Dialed",
        "colour": "#ffe100",
        "search": /catches some rays/iu},
    {"id": "UNHOLEY",
        "name": "Unholey",
        "colour": "#863490",
        "search": /compressed by gamma/iu},
    {"id": "CONSUMERS",
        "name": "CONSUMERS",
        "colour": "#c80c0c",
        "search": /consumers/iu},
    {"id": "ITEMDAMAGE",
        "name": "Item Damaged",
        "colour": "#6dc0ff",
        "search": /broke|breaks|damaged/iu},
    {"id": "SHAME",
        "name": "SHAME",
        "colour": "#800878",
        "search": /shame/iu},
    {"id": "UNKNOWN",
        "name": "Unknown Event",
        "colour": "#010101"}
];

/**
 * Handles game events
 * @param {game} game
 * @param {intager} index
 * @returns {void}
 */
function handleEvents (game, index) {

    const gameEvents = [];

    for (let ind = index; ind < game.outcomes.length; ind++) {

        const outcome = game.outcomes[ind];
        let type = null;

        for (const eventType of eventTypes) {

            if (eventType.search?.test(outcome)) {

                type = eventType;

            }

        }
        if (!type) {

            type = eventTypes.find((event) => event.id === "UNKNOWN");

        }
        gameEvents.push({
            "id": game.id,
            "eventType": type,
            "flavor": outcome
        });

    }
    const embeds = [];

    for (const event of gameEvents) {

        const embed = new MessageEmbed()
            .setTitle(event.flavor)
            .setColor(event.eventType.colour)
            .setFooter(`${game.awayTeamNickname} vs ${game.homeTeamNickname}\n`
            + `Season ${game.season + 1} Day ${game.day + 1}`);

        embeds.push(embed);

    }

    return embeds;

}

// Handle channel deletions
client.on("channelDelete", (channel) => {

    const {id} = channel;

    scores.deleteMany({"channel_id": id}).catch(console.error);
    subscriptions.deleteMany({"channel_id": id}).catch(console.error);
    summaries.deleteMany({"channel_id": id}).catch(console.error);
    betReminders.deleteMany({"channel_id": id}).catch(console.error);
    compacts.deleteMany({"channel_id": id}).catch(console.error);
    eventsCol.deleteMany({"channel_id": id}).catch(console.error);

});
