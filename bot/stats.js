const io = require("@pm2/io");

io.init({
    metrics: {
        eventLoop: false,
        network: false,
        http: false,
        gc: false,
        v8: false
    }
});

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
    name: "commands/5min",
    samples: 60,
    timeframe: 300
});
global.stats.gameEvents = io.meter({
    name: "game-events/5min",
    samples: 60,
    timeframe: 300
});
global.stats.ratelimit = io.counter({
    name: "Ratelimits",
    type: "counter"
});

