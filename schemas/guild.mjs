import {Mongoose} from "mongoose";

const guild_schema = new Mongoose.Schema({
    "guild_id": String,
    "forbidden_knowlage": Boolean
});

export default guild_schema;
export const model = Mongoose.model("guilds", guild_schema);
