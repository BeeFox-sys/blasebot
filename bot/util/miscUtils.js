const {scores, subscriptions, summaries, betReminders} = require("../schemas/subscription");

function msgError(error){
    switch(error.code){
    case 10003:
        {
            let id = error.path.split("/")[2];
            scores.deleteMany({channel_id:id}).catch(console.error);
            subscriptions.deleteMany({channel_id:id}).catch(console.error);
            summaries.deleteMany({channel_id:id}).catch(console.error);
            betReminders.deleteMany({channel_id:id}).catch(console.error);
            console.error(`Couldn't find channel ${id}, deleted from collections`);
        }
        break;

    default:
        console.error(error);
    }
}

module.exports = {
    messageError:msgError
};