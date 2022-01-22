/* eslint-disable object-property-newline*/

import Mongoose from "mongoose";

const channel_schema = new Mongoose.Schema({
    "channel_id": String,
    "guild_id": String,
    "sub_bets": {"type": Boolean, "default": false},
    "bet_interval": {"type": Number, "defualt": 8},
    "commands_enabled": {"type": Boolean, "default": true},
    "sub_weather": {"type": Boolean, "default": false},
    "sub_items": {"type": Boolean, "default": false},
    "sub_modifications": {"type": Boolean, "default": false},
    "sub_changes": {"type": Boolean, "default": false},
    "sub_takeover": {"type": Boolean, "default": false},
    "sub_incineration": {"type": Boolean, "default": false},
    "sub_misc": {"type": Boolean, "default": false}
});

export default channel_schema;
export const model = Mongoose.model("channels", channel_schema);
