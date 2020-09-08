const Mongoose = require("mongoose");


let subscription = new Mongoose.Schema({
    channel_id: String,
    guild_id: String,
    team: String
});

let summary = new Mongoose.Schema({
    channel_id: String,
    guild_id: String,
    team: String
});

let score = new Mongoose.Schema({
    channel_id: String,
    guild_id: String,
    team: String
});

let compact = new Mongoose.Schema({
    channel_id: String,
    guild_id: String,
    team: String
});

let bet = new Mongoose.Schema({
    channel_id: String
});

subscription.index("team");

module.exports = {
    subscriptions: Mongoose.model("subscriptions",subscription),
    summaries: Mongoose.model("summaries", summary),
    scores: Mongoose.model("scores",score),
    compacts: Mongoose.model("compacts", compact),
    betReminders: Mongoose.model("bets",bet)
};