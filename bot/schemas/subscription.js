const Mongoose = require("mongoose");


const subscription = new Mongoose.Schema({
    "channel_id": String,
    "guild_id": String,
    "team": String
});

const summary = new Mongoose.Schema({
    "channel_id": String,
    "guild_id": String,
    "team": String
});

const score = new Mongoose.Schema({
    "channel_id": String,
    "guild_id": String,
    "team": String
});

const compact = new Mongoose.Schema({
    "channel_id": String,
    "guild_id": String,
    "team": String
});

const bet = new Mongoose.Schema({
    "channel_id": String
});

const events = new Mongoose.Schema({
    "channel_id": String,
    "guild_id": String
});

subscription.index("team");

module.exports = {
    "subscriptions": Mongoose.model("subscriptions", subscription),
    "summaries": Mongoose.model("summaries", summary),
    "scores": Mongoose.model("scores", score),
    "compacts": Mongoose.model("compacts", compact),
    "betReminders": Mongoose.model("bets", bet),
    "eventsCol": Mongoose.model("events", events)
};
