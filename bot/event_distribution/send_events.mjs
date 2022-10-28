import {PermissionsBitField} from "discord.js";
import {model as channels} from "../../schemas/channel.mjs";
import {model as team_subscription} from "../../schemas/team_subscription.mjs";
import {client} from "../main.mjs";

/**
 * Distributes a message to channels of team subscriptions
 * @param {Array<String>} teams - Team IDs
 * @param {Object} filter - Filter for found objects
 * @param {Object} message - DiscordjsOptions
 * @returns {Promise}
 */
export async function send_teams (teams, filter, message) {

    // Find all subscriptions with the relevant teams
    const subs = await team_subscription.find({"$or": [{"team_id": {"$in": teams}}]}).find(filter)
        .exec();

    // Each subscription document, this uses forEach because at this point nothing needs wait on anything else that cannot be done with .then
    return subs.forEach((sub) => {

        // get channel
        client.channels.fetch(sub.channel_id)
            .then((channel) => {

                // Can view channel?
                if (!channel.viewable) {

                    return;

                }
                // Can send messages?
                if (channel.guild
                    && !channel
                        .permissionsFor(channel.guild.me)
                        .has(PermissionsBitField.Flags.SendMessages)
                ) {

                    return;

                }
                // Send it on!
                channel.send(message)
                    .catch((error) => {

                        switch (error.code) {

                        case 50001:
                        case 10003:
                            sub.delete();
                            break;
                        default:
                            console.error(error);
                        
                        }
                    
                    });

            })
            .catch((error) => {

                switch (error.code) {

                case 50001:
                case 10003:
                    sub.delete();
                    break;
                default:
                    console.error(error);
                
                }
            
            });
    
    });

}

/**
 * Distributes a message to channels
 * @param {Object} filter - Filter for found objects
 * @param {Object} message - DiscordjsOptions
 * @returns {Promise}
 */
export async function send_channels (filter, message) {

    // Find all subscriptions with the relevant teams
    const subs = await channels.find(filter).exec();

    // Each subscription document, this uses forEach because at this point nothing needs wait on anything else that cannot be done with .then
    return subs.forEach((sub) => {

        // get channel
        client.channels.fetch(sub.channel_id)
            .then((channel) => {

                // Can view channel?
                if (!channel.viewable) {

                    return;

                }
                // Can send messages?
                if (channel.guild
                    && !channel
                        .permissionsFor(channel.guild.me)
                        .has(PermissionsBitField.Flags.SendMessages)
                ) {

                    return;

                }
                // Send it on!
                channel.send(message)
                    .catch((error) => {

                        switch (error.code) {

                        case 50001:
                        case 10003:
                            sub.delete();
                            break;
                        default:
                            console.error(error);
                        
                        }
                    
                    });

            })
            .catch((error) => {

                switch (error.code) {

                case 50001:
                case 10003:
                    sub.delete();
                    break;
                default:
                    console.error(error);
                
                }
            
            });
    
    });

}
