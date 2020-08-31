const Mongoose = require("mongoose");


let guild = new Mongoose.Schema({
    guild_id: String,
    forbidden: {type: Boolean, default: false}
});


module.exports = {
    guilds: Mongoose.model("guilds",guild),
};