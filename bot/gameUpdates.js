const {client} = global;
// Const {generateGameCard} = require("./util/gameUtils");
const {emojiString} = require("./util/teamUtils");

const {
    subscriptions,
    summaries,
    scores,
    betReminders,
    compacts,
    eventsCol
} = require("./schemas/subscription");

// Const {events, sim, games} = require("blaseball");

const {clearChannelData} = require("./util/miscUtils");

// Current: Original
const TrueTeam = {
    "8d7ba290-5f87-403c-81e3-cf5a2b6a6082": "c73b705c-40ad-4633-a6ed-d357ee2e2bcf", // Lift
    "d82a1a80-dff3-4767-bab6-484b2eb7aee1": "a37f9158-7f82-46bc-908c-c9e2dda7c33b", // Jazz Hands
    "16d1fd9b-c62b-4bed-b68a-b3a2d6e21524": "ca3f1c8c-c025-4d8e-8eef-5be6accbeb16", // Firefighters
    "86f4485a-a6db-470b-82f5-e95e6b353537": "747b8e4a-7e50-4638-a973-ea7950a3e739", // Tigers
    "23a2cea4-5df7-4ed0-bb2c-b8c297518ada": "57ec08cc-0411-4643-b304-0e80dbc15ac7", // Wild Wings
    "44d9dc46-7e81-4e21-acff-c0f5dd399ae3": "d9f89a8a-c563-493e-9d64-78e4f9a55d4a", // Georgias

    "2957236a-6077-4012-a445-8c5be111afd0": "878c1bf6-0d21-4659-bfee-916c8314d69c", // Tacos
    "89796ffb-843a-4163-8dec-1bef229c68cb": "b63be8c2-576a-4d6e-8daf-814f8bcea96f", // Dale
    "93e71a0e-80fc-46b7-beaf-d204c425fe03": "3f8bbb15-61c0-4e3f-8e4a-907a5fb1565e", // Flowers
    "57d3f614-f8d3-4dfd-b486-075f823fdb0b": "f02aeae2-5e6a-4098-9842-02d2273f25c7", // Sunbeams
    "6526d5df-6a9c-48e1-ba50-12dec0d8b22f": "9debc64f-74b7-4ae1-a4d6-fce0144b6ea5", // Spies
    "74aea6b6-34f9-48f4-b298-7345e1f9f7cb": "bb4a9de5-c924-4923-a0cb-9d1445f1ee5d", // Worms

    "b069fdc6-2204-423a-932c-09037adcd845": "36569151-a2fb-43c1-9df7-2df512424c82", // Millennials
    "0b672007-ebfb-476d-8fdb-fb66bad78df2": "b024e975-1c4a-4575-8936-a3754a08806a", // Steaks
    "b320131f-da0d-43e1-9b98-f936a0ee417a": "b72f3061-f573-40d7-832a-5ad475bd7909", // Lovers
    "76d3489f-c7c4-4cb9-9c58-b1e1bab062d1": "23e4cbc1-e9cd-47fa-a35b-bfa06f726cb7", // Pies
    "2dc7a1fa-3ae6-47ed-8c92-5d80167959f5": "105bc3ff-1320-4e37-8ef0-8d595cb95dd0", // Garages
    "e11df0cc-3a95-4159-9a84-fecbbf23ae05": "46358869-dce9-4a01-bfba-ac24fc56f57e", // Mechanics

    "effdbd8d-a54f-4049-a3c8-b5f944e5278b": "979aee4a-6d80-4863-bf1c-ee1a78e06024", // Hawai'i Fridays
    "8981c839-cbcf-47e3-a74e-8731dcff24fe": "eb67ae5e-c4bf-46ca-bbbc-425cd34182ff", // Moist Talkers
    "75667373-b350-499b-b86e-5518b6f9f6ab": "bfd38797-8404-4b38-8b82-341da28b1f83", // Shoe Thieves
    "a01f0ade-0186-464d-8c68-e19a29cb66f0": "7966eb04-efcc-499b-8f03-d13916330531", // Magic
    "b7df2ea6-f4e8-4e6b-8c98-f730701f3717": "adc5b394-8f76-416d-9ce9-813706877b84", // Breath Mints
    "b35926d4-22a3-4419-8fab-686c41687055": "8d87c468-699a-47a8-b40d-cfb73a5660ad" // Crabs
};


const propositions = [
    "i think",
    "pretty sure",
    "probably",
    "im sure its fine",
    "this is correct?",
    "im trying my best",
    "hmm",
    "right?",
    "yeah?"
];

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
                    "team": TrueTeam[newGame.homeTeam]
                },
                {
                    "team": TrueTeam[newGame.awayTeam]
                }
            ]
        });

        if (docs.length === 0) {

            return;

        }

        for (const compactSubscription of docs) {

            // Anti double posting
            if (
                compactSubscription.team === TrueTeam[newGame.awayTeam]
                && docs.find((doc) => doc.team === TrueTeam[newGame.homeTeam]
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

                    const proposition = `\n*${propositions[Math.floor(Math.random() * propositions.length)]}*`;

                    channel.send(`${message}`)
                        .then(() => {

                            if (Math.random() > 0.9) {

                                channel.send(`${proposition}`)
                                    .catch((error) => subscriptionError(
                                        error,
                                        compactSubscription.channel_id
                                    ));
                            
                            }
                        
                        })
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

const EventSource = require("eventsource");
const streamData = new EventSource("https://api.blaseball.com/events/streamData");

streamData.onmessage = compactScores;

/*
 * streamData.onopen = () => console.log("Connected to Blaseball");
 * streamData.onerror = console.error;
 */

let oldGames = null;
let oldData = null;
let currentJson = null;
const equal = require("deep-equal");
const diff = require("deep-diff");

// Compact Scores
/**
 *
 * @param {Objext} recievedData
 *
 */
async function compactScores (recievedData) {

    const cleanData = JSON.parse(recievedData.data);

    // Debounce
    if (!oldData || equal(cleanData, oldData)) {

        // eslint-disable-next-line no-eq-null
        /*
         * console.log(
         *     "- Debounce.\n| Old Data exists:",
         *     (oldData !== null),
         *     "\n| Old data is same as previous:",
         *     equal(cleanData, oldData)
         * );
         */
        oldData = cleanData;
        if (cleanData.value) {

            currentJson = cleanData.value;
            // console.log(currentJson);
        
        }
        
        return;

    }
    oldData = cleanData;

    const newJson = currentJson;

    // Diff
    if (cleanData.value) {

        currentJson = cleanData.value;
        
    } else if (cleanData.delta) {
        
        // const newDiff = diff.applyDiff(currentJson, cleanData.delta);

        // eslint-disable-next-line guard-for-in
        for (const patch in cleanData.delta) {

            diff.applyChange(newJson, {}, patch);
        
        }

        // console.log("Applyed Diff");
        currentJson = newJson;

    } else {
        
        console.log("Unkown JSON key, skipping update");
        
        return;

    }

    const localOldGames = oldGames;

    const {schedule} = newJson.games;

    for (const newGame of schedule) {
        
        
        const oldGame
            = localOldGames?.find((potentialOldGame) => potentialOldGame.id === newGame.id)
            ?? null;


        if (
            !oldGame
            || newGame.gameComplete
            || (oldGame.playCount && oldGame.playCount === newGame.playCount)
        ) {

            continue;
        
        }


        if (
            oldGame.homeScore !== newGame.homeScore
            || oldGame.awayScore !== newGame.awayScore
            || newGame.scoreUpdate?.length > 0
        ) {
            
            await sendScoreUpdateMessage(newGame, oldGame);

        }
    
    }
    oldGames = schedule;

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
