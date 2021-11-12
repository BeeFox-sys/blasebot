import Mongoose from "mongoose";

const team_subscription_schema = new Mongoose.Schema({
    "channel_id": String,
    "guild_id": String,
    "team_id": String,
    "sub_scores": Boolean,
    "sub_summaries": Boolean,
    "sub_player_changes": Boolean,
    "sub_items": Boolean,
    "sub_flavour": Boolean,
    "sub_plays": Boolean
});

export default team_subscription_schema;
export const model = Mongoose.model("team_subscriptions", team_subscription_schema);
