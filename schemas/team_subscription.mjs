/* eslint-disable object-property-newline*/

import Mongoose from "mongoose";

const team_subscription_schema = new Mongoose.Schema({
    "channel_id": String,
    "guild_id": String,
    "team_id": String,
    "sub_scores": {"type": Boolean, "default": false},
    "sub_summaries": {"type": Boolean, "default": false},
    "sub_player_changes": {"type": Boolean, "default": false},
    "sub_items": {"type": Boolean, "default": false},
    "sub_flavour": {"type": Boolean, "default": false},
    "sub_plays": {"type": Boolean, "default": false}
});

export default team_subscription_schema;
export const model = Mongoose.model("team_subscriptions", team_subscription_schema);
