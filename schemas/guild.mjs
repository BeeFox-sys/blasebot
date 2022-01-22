/* eslint-disable object-property-newline*/
import Mongoose from "mongoose";

const guild_schema = new Mongoose.Schema({
    "guild_id": String,
    "forbidden_knowlage": {"type": Boolean, "default": false}
});

export default guild_schema;
export const model = Mongoose.model("guilds", guild_schema);
