const Mongoose = require("mongoose");



//guild_id can either be a guild id OR a DM channel id
let guild = new Mongoose.Schema({
    guild_id: String,
    forbidden: {type: Boolean, default: false}
});


module.exports = {
    guilds: Mongoose.model("guilds",guild),
};