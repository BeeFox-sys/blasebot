import * as debug from "./debug.mjs";
import * as subscribe from "./subscribe.mjs";

export default {
    "debug": debug.commandFunction,
    "subscribe": subscribe.commandFunction
};

export const data = [
    debug.commandData,
    subscribe.commandData
];
