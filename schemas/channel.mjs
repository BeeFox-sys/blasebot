import Mongoose from "mongoose";

const channel_schema = new Mongoose.Schema({
    "channel_id": String,
    "guild_id": String,
    "sub_bets": Boolean,
    "bet_interval": Number,
    "commands_enabled": Boolean,
    "sub_weather": Boolean,
    "sub_items": Boolean,
    "sub_modifications": Boolean,
    "sub_changes": Boolean,
    "sub_takeover": Boolean,
    "sub_incineration": Boolean,
    "sub_misc": Boolean
});

export default channel_schema;
export const model = Mongoose.model("channels", channel_schema);
