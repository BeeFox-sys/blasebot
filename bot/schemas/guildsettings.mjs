import Mongoose from "mongoose";


// Guild_id can either be a guild id OR a DM channel id
const guild = new Mongoose.Schema({
    "guild_id": String,
    "forbidden": {"type": Boolean,
        "default": false}
});


export const guilds = Mongoose.model("guilds", guild);
