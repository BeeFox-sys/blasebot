const Mongoose = require("mongoose");


let subscription = new Mongoose.Schema({
    channel_id: String,
    guild_id: String,
    team: String
});

subscription.index("team");

module.exports = Mongoose.model("subscriptions",subscription);