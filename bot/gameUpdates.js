const {client} = global;
const {generateGameCard} = require("./util/gameUtils");
const {emojiString} = require("./util/teamUtils");

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

    case -1: speak = {
        "colour": "#ffffff",
        "formatting": "*"
    };
        break;
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
        "name": "The Reader",
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
        "colour": "#b3b3b3",
        "url": "https://ik.imagekit.io/beefox/blaseball/Lootcrates.png",
        "formatting": "*"
    };
        break;
    case 6: speak = {
        "colour": "#ea5b23",
        "formatting": "**"
    };
        break;
    default: speak = {
        "name": "???",
        "colour": "#666666",
        "url": ""
    };

    }

    const speakMessage = new MessageEmbed()
        .setTitle(temporal.doc.zeta
            ? `${
                speak.formatting ?? ""
            }${
                temporal.doc.zeta.replace(/\*/gu, "\\*").replace(/_/gu, "\\_")
            }${
                speak.formatting ?? ""
            }`
            : "")
        .setColor(speak.colour);

    if (speak.name) {

        speakMessage.setAuthor(speak.name, speak.url, "https://blaseball.com");

    }
    // If(bossFights.length > 0)speakMessage.setFooter(`Season [${sim().season+1}] Day [X]`);
    const docs = await eventsCol.find({});

    for (const doc of docs) {

        const channel = await client.channels.fetch(doc.channel_id)
            .catch((error) => subscriptionError(error, doc.channel_id));

        if (channel) {

            channel.send(speakMessage)
                .catch((error) => subscriptionError(error, doc.channel_id));
        
        }
    
    }

}

/**
 * Generates and sends a game update message to subscribed channels
 * @param {json} newGame
 * @param {json} [oldGame=null]
 * @param {json} [overrideNew={}]
 */
async function sendScoreUpdateMessage (newGame, oldGame = null, overrideNew = {}) {

    Object.assign(newGame, overrideNew ?? {});

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

            // Anti double posting
            if (
                compactSubscription.team === newGame.awayTeam
                && docs.find((doc) => doc.team === newGame.homeTeam
                && doc.channel_id === compactSubscription.channel_id)) {

                continue;

            }

            const homeDiff = oldGame ? newGame.homeScore - oldGame.homeScore : 0;
            const awayDiff = oldGame ? newGame.awayScore - oldGame.awayScore : 0;

            const message = `**${
                (newGame.topOfInning || newGame.inning === -1)
                    ? "Top"
                    : "Bottom"
            } of ${
                Math.max(newGame.inning + 1, 1)
            }** | ${
                emojiString(newGame.awayTeamEmoji)
            } ${
                awayDiff > 0 ? "**" : (awayDiff < 0 ? "*" : "")
            }${
                newGame.awayScore
            }${
                awayDiff > 0 ? "**" : (awayDiff < 0 ? "*" : "")
            }, ${
                emojiString(newGame.homeTeamEmoji)
            } ${
                homeDiff > 0 ? "**" : (homeDiff < 0 ? "*" : "")
            }${
                newGame.homeScore
            }${
                homeDiff > 0 ? "**" : (homeDiff < 0 ? "*" : "")
            }\n>>> ${
                newGame.lastUpdate
            }${
                newGame.scoreUpdate
                    ? `\n*\`${newGame.scoreUpdate}\`*`
                    : ""
            }`;

            client.channels.fetch(compactSubscription.channel_id)
                .then((channel) => {
                  
                    channel.send(message)
                        .catch((error) => subscriptionError(
                            error,
                            compactSubscription.channel_id
                        ));

                })
                .catch(console.error);

        }

    } catch (err) {

        console.error(err);

    }

}

// --- Game Start ---

// Compact Scores ("Play ball!")
events.on("gameStart", async (game) => {

    /*
     * The bot will sometimes miss updates, so hardcode the message unless the actual update has a
     * score update.
     */
    await sendScoreUpdateMessage(game, null, game?.scoreUpdate && game.scoreUpdate.length > 0
        ? null
        : {
            "topOfInning": true,
            "inning": 0,
            "homeScore": 0,
            "awayScore": 0,
            "lastUpdate": "Play ball!",
            "scoreUpdate": null
        });

});


// --- Game Updates ---

// Outcomes
events.on("gameUpdate", async (newGame, oldGame) => {

    try {

        if (!oldGame || newGame.outcomes?.length === oldGame.outcomes?.length) {

            return;

        }

        const outcomes = handleEvents(newGame, oldGame.outcomes.length);

        if (!outcomes.length) {

            return;

        }

        const docs = await eventsCol.find({});

        for (const doc of docs) {

            const channel = await client.channels.fetch(doc.channel_id)
                .catch((error) => subscriptionError(error, doc.channel_id));

            if (!channel) {

                clearChannelData(doc.channel_id);
                continue;

            }
            for (const outcome of outcomes) {

                channel.send(outcome)
                    .catch((error) => subscriptionError(error, outcome.channel_id));

            }

        }

    } catch (err) {

        console.error(err);

    }

});

// Compact Scores
events.on("gameUpdate", async (newGame, oldGame) => {

    if (!oldGame
        || newGame.gameComplete
        || (oldGame.playCount && oldGame.playCount === newGame.playCount)) {

        return;

    }

    if (oldGame.homeScore !== newGame.homeScore
        || oldGame.awayScore !== newGame.awayScore
        || newGame.scoreUpdate?.length > 0) {

        await sendScoreUpdateMessage(newGame, oldGame);

    }

});

// -- Post Game --

// Summary
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
            }${
                game.isPostseason
                    ? ""
                    : ` of ${game.seriesLength}`
            } finished!`, summary)
                .catch((error) => subscriptionError(error, summarySubscription.channel_id)))
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
                        emojiString(game.awayTeamEmoji)
                    } v. ${
                        emojiString(game.homeTeamEmoji)
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
        for (const doc of docs) {

            client.channels.fetch(doc.channel_id)
                .then((betchannel) => betchannel.send(`All Season ${
                    sim().season + 1
                } Day ${
                    sim().day + 1
                } Games Complete!${
                    tomorrowSchedule.length > 0
                        ? " Go Bet!"
                        : " Go catch up on some sleep!"
                }`, oddsEmbed)
                    .catch((error) => subscriptionError(error, doc.channel_id)))
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
    {"id": "SUN30",
        "name": "Sun 30",
        "colour": "#ffca4f",
        "search": /sun 30/iu},
    {"id": "SMITHY",
        "name": "Item Repaired",
        "colour": "#B0581E",
        "search": /repaired|smithy/iu},
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
    {"id": "FAX",
        "name": "Fax Machine",
        "colour": "#8b5cad",
        "search": /replaced by incoming fax/iu},
    {"id": "VOICEMAIL",
        "name": "Voicemail",
        "colour": "#465aab",
        "search": /replaced by incoming voicemail/iu},
    {"id": "UNDERTAKER",
        "name": "Undertaker",
        "colour": "#163321",
        "search": /flipped .* negative/iu},
    {"id": "PEANUTMISTER",
        "name": "Peanut Mister",
        "colour": "#f3ff54",
        "search": /cured of their peanut allergy|no longer superallergic/iu},
    {"id": "CONSUMERS",
        "name": "CONSUMERS",
        "colour": "#c80c0c",
        "search": /consumers/iu},
    {"id": "ITEMDAMAGE",
        "name": "Item Damaged",
        "colour": "#6dc0ff",
        "search": /\bdamaged\b/iu},
    {"id": "ITEMBREAK",
        "name": "Item Broken",
        "colour": "#6dc0ff",
        "search": /\bbroke\b|\bbreaks?\b/iu},
    {"id": "ITEMDROPPED",
        "name": "Item Dropped",
        "colour": "#6dc0ff",
        "search": /\bdropped\b/iu},
    {"id": "PRIZEMATCH",
        "name": "Prize Match",
        "colour": "#c63f3d",
        "search": /won the prize match/iu},
    {"id": "YOLKED",
        "name": "Yolked",
        "colour": "#ebdb34",
        "search": /a consumer!/iu},
    {"id": "TUNNELSTEAL",
        "name": "Item Stolen",
        "colour": "#342e26",
        "search": /.* stole .*!/u},
    {"id": "TRADER",
        "name": "Trader",
        "colour": "#205c6b",
        "search": /trader .* traded their/iu},
    {"id": "TRAITOR",
        "name": "Traitor",
        "colour": "#63212c",
        "search": /traitor .* traded their/iu},
    {"id": "THIEVESGUILD",
        "name": "Phantom Thieves' Guild",
        "colour": "#ff2e5f",
        "search": /thieves' guild/iu},
    {"id": "FIFTHBASE",
        "name": "The Fifth Base",
        "colour": "#4a001a",
        "search": /.* (?:took|placed) The Fifth Base (?:from|in) .*/u},
    {"id": "SHAME",
        "name": "SHAME",
        "colour": "#800878",
        "search": /were shamed|shamed the/iu},
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
            .setFooter(`${emojiString(game.awayTeamEmoji)}\u{FE0F} ${game.awayTeamNickname} vs ${
                emojiString(game.homeTeamEmoji)}\u{FE0F} ${game.homeTeamNickname}\n`
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

/**
 *
 * @param {error} error
 * @param {channel} channel_id
 */
function subscriptionError (error, channel_id) {

    switch (error.code) {
    
    case 50001: // Missing Channel Access
    // eslint-disable-next-line capitalized-comments
    // case 10003: // Cannot GET Channel // eslint-disable-line no-fallthrough
    case 50007: // Cannot POST User
    case 50013: // Cannot POST Channel
        clearChannelData(channel_id);
        break;
    
    default: console.error(error);
    
    }

}
