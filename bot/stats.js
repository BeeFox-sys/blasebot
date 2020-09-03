const io = require("@pm2/io");

global.stats = {};
global.stats.messageFreq = io.meter({
    name: "messages/sec",
    type: "meter",
});
global.stats.dbQueryFreq = io.meter({
    name: "query/sec",
    type: "meter"
});
global.stats.guildCount = io.metric({
    name: "guilds",
    value: () => {return global.client.guilds.cache.size;}
});
global.stats.commandFreq = io.meter({
    name: "commands/15min",
    samples: 60,
    timeframe: 900
});
