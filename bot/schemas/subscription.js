import Mongoose from "mongoose";


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


export const subscriptions = Mongoose.model("subscriptions", subscription);
export const summaries = Mongoose.model("summaries", summary);
export const scores = Mongoose.model("scores", score);
export const compacts = Mongoose.model("compacts", compact);
export const betReminders = Mongoose.model("bets", bet);
export const eventsCol = Mongoose.model("events", events);

