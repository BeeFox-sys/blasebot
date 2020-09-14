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
    case 50001:
        {
            let id = error.path.split("/")[2];
            scores.deleteMany({channel_id:id}).catch(console.error);
            subscriptions.deleteMany({channel_id:id}).catch(console.error);
            summaries.deleteMany({channel_id:id}).catch(console.error);
            betReminders.deleteMany({channel_id:id}).catch(console.error);
            console.error(`Missing read messages permission for channel ${id}, removed from collections`);
        }
        break;
    case 50013:
        {
            let id = error.path.split("/")[2];
            scores.deleteMany({channel_id:id}).catch(console.error);
            subscriptions.deleteMany({channel_id:id}).catch(console.error);
            summaries.deleteMany({channel_id:id}).catch(console.error);
            betReminders.deleteMany({channel_id:id}).catch(console.error);
            console.error(`Missing unknown permissions for channel ${id} removed from collections`);
        }
        break;
    case 500:
        {
            console.error(`Discord Internal Server Error At ${error.path}`);
        }
        break;

    default:
        console.error(error);
    }
}


module.exports = {
    messageError:msgError,
};