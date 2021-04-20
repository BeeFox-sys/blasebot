const Mongoose = require("mongoose");


// Guild_id can either be a guild id OR a DM channel id
const guild = new Mongoose.Schema({
    "guild_id": String,
    "forbidden": {"type": Boolean,
        "default": false}
});


module.exports = {
    "guilds": Mongoose.model("guilds", guild)
};
