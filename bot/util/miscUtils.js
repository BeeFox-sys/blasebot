const {scores,
    subscriptions,
    summaries,
    betReminders,
    compacts,
    eventsCol} = require("../schemas/subscription");


/**
 * Clears all data from channel
 * @param {channelID} channelID
 */
function clear (channelID) {

    scores.deleteMany({"channel_id": channelID}).catch(console.error);
    subscriptions.deleteMany({"channel_id": channelID}).catch(console.error);
    summaries.deleteMany({"channel_id": channelID}).catch(console.error);
    betReminders.deleteMany({"channel_id": channelID}).catch(console.error);
    compacts.deleteMany({"channel_id": channelID}).catch(console.error);
    eventsCol.deleteMany({"channel_id": channelID}).catch(console.error);

}

module.exports = {
    "clearChannelData": clear
};

