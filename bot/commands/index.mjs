import * as debug from "./debug.mjs";
import * as subscribe from "./subscribe.mjs";
import * as info from "./info.mjs";


export default {
    "debug": debug.commandFunction,
    "subscribe": subscribe.commandFunction,
    "info": info.commandFunction
};

export const data = [
    debug.commandData,
    subscribe.commandData,
    info.commandData
];
