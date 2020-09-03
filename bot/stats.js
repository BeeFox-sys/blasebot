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

