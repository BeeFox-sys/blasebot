import {SlashCommandBuilder, SlashCommandSubcommandBuilder, ButtonStyle} from "discord.js";

export const commandData = new SlashCommandBuilder()
    .setName("subscribe")
    .setDescription("opens the subscription manager")
    .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("team")
        .setDescription("Subscribe to one of the active teams"))
    .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("events")
        .setDescription("Subscribe to global events"));


// eslint-disable-next-line no-unused-vars
import {CommandInteraction, ActionRow,
    ButtonBuilder, SelectMenuBuilder, PermissionsBitField} from "discord.js";
import {getChannelSub, getTeamSub} from "../util/guild.mjs";
import {get_active_teams} from "../util/team.mjs";

/**
 *
 * @param {CommandInteraction} commandEvent
 */
export async function commandFunction (commandEvent) {

    if (!commandEvent.memberPermissions.has(PermissionsBitField.FLAGS.MANAGE_CHANNELS)) {

        commandEvent.reply({
            // eslint-disable-next-line max-len
            "content": "You do not have permission to set the subscriptions for this channel, you require the manage channel permission to do so!\nPlease contact someone who has such permission!",
            "ephemeral": true
        });
        
        return;
    
    }
    
    switch (commandEvent.options.getSubcommand()) {

    case "team":
        team_subscription(commandEvent);
        break;
    case "events":
        event_subscription(commandEvent);
        break;
    default:

    
    }

}

/**
 *
 * @param {CommandInteraction} commandEvent
 */
async function team_subscription (commandEvent) {

    const teams = await get_active_teams();
    const teamMap = teams.map((team) => ({
        "label": team.fullName,
        "description": team.slogan,
        "value": team.id
    })).sort((aVal, bVal) => {

        const nameA = aVal.label.toLowerCase();
        const nameB = bVal.label.toLowerCase();

        if (nameA < nameB) {

            return -1;
        
        }
        if (nameA > nameB) {

            return 1;
        
        }

        return 0;
    
    });


    const row
     = new ActionRow()
         .addComponents(newSelectMenuBuilder()
             .setCustomId("subscription_team_select")
             .setPlaceholder("Select a Team")
             .addOptions(teamMap));


    const response = await commandEvent.reply({
        "content": "** **",
        "components": [row],
        "fetchReply": true
    });

    response.awaitMessageComponent({
        "componentType": "SELECT_MENU",
        "time": 60000,
        "filter": (interaction) => interaction.user === commandEvent.user
    })
        .then(async (interaction) => {

            const sub = await getTeamSub(interaction.channelId, interaction.values[0]);

            const teamObj = teamMap.find((team) => team.value === interaction.values[0]);

            await createTeamPanel(sub, interaction, teamObj);

        })
        .catch(async (error) => {

            if (error.code === "INTERACTION_COLLECTOR_ERROR") {

                console.log(row.components[0].setDisabled());
                response.edit({
                    "content": "** **",
                    "components": [row]
                });
            
            } else {

                console.error(error);
            
            }
        
        });

}

/**
 *  Creates and maintains a button pannel for subscribing to teams
 * @param {*} model
 * @param {*} interaction
 * @param {*} teamObj
 * @param {*} disabled
 * @returns {void}
 */
async function createTeamPanel (model, interaction, teamObj, disabled = false) {

    const rows = [
        new ActionRow()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Scores ")
                    .setCustomId("sub_scores")
                    .setStyle(model.sub_scores ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setLabel("Summaries")
                    .setCustomId("sub_summaries")
                    .setStyle(model.sub_summaries ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setDisabled(disabled || true)
            ),
        new ActionRow()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Players")
                    .setCustomId("sub_player_changes")
                    .setStyle(model.sub_player_changes ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setDisabled(disabled || true),
                new ButtonBuilder()
                    .setLabel(" Items ")
                    .setCustomId("sub_items")
                    .setStyle(model.sub_items ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setDisabled(disabled || true)
            ),
        new ActionRow()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Flavour")
                    .setCustomId("sub_flavour")
                    .setStyle(model.sub_flavour ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setDisabled(disabled || true),
                new ButtonBuilder()
                    .setLabel(" Plays ")
                    .setCustomId("sub_plays")
                    .setStyle(model.sub_plays ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setDisabled(disabled)
            )
    ];

    let response = null;

    if (disabled) {

        const reply = await interaction.fetchReply();

        reply.edit({
            "content": `**${teamObj.label}**\n*${teamObj.description}*`,
            "components": rows,
            "fetchReply": true
        });

        return;

    }

    response = await interaction.update({
        "content": `**${teamObj.label}**\n*${teamObj.description}*`,
        "components": rows,
        "fetchReply": true
    });
    

    response.awaitMessageComponent({
        "componentType": "BUTTON",
        "time": 60000,
        "filter": (inter) => inter.user === interaction.user
    })
        .then(async (buttonInteraction) => {
            
            model[buttonInteraction.customId] = !model[buttonInteraction.customId];

            const newModel = await model.save();

            createTeamPanel(newModel, buttonInteraction, teamObj);
        
        })
        .catch((error) => {

            if (error.code === "INTERACTION_COLLECTOR_ERROR") {

                createTeamPanel(model, interaction, teamObj, true);
            
            } else {

                console.error(error);
            
            }
            
        
        });

}


/**
 * Creates and maintains a button pannel for subscribing to events
 * @param {*} interaction
 * @param {*} model
 * @param {*} disabled
 * @returns {void}
 */
async function event_subscription (interaction, model = null, disabled = false) {

    if (model === null) {

        // eslint-disable-next-line require-atomic-updates, no-param-reassign
        model = await getChannelSub(interaction.channelId);

    
    }

    const rows = [
        new ActionRow()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Bets")
                    .setCustomId("sub_bets")
                    .setStyle(model.sub_bets ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setDisabled(disabled || true)
                ,
                new ButtonBuilder()
                    .setLabel("Weather")
                    .setCustomId("sub_weather")
                    .setStyle(model.sub_weather ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setDisabled(disabled)
                ,
                new ButtonBuilder()
                    .setLabel("Items")
                    .setCustomId("sub_items")
                    .setStyle(model.sub_items ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setDisabled(disabled || true)

            ),
        new ActionRow()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Modifications")
                    .setCustomId("sub_modifications")
                    .setStyle(model.sub_modifications ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setDisabled(disabled || true)
                ,
                new ButtonBuilder()
                    .setLabel("Changes")
                    .setCustomId("sub_changes")
                    .setStyle(model.sub_changes ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setDisabled(disabled || true)
                ,
                new ButtonBuilder()
                    .setLabel("Takeover")
                    .setCustomId("sub_takeover")
                    .setStyle(model.sub_takeover ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setDisabled(disabled)

            ),
        new ActionRow()
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Incineration")
                    .setCustomId("sub_incineration")
                    .setStyle(model.sub_incineration ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setDisabled(disabled)
                ,
                new ButtonBuilder()
                    .setLabel("Misc")
                    .setCustomId("sub_misc")
                    .setStyle(model.sub_misc ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setDisabled(disabled || true)

            )
            
    ];

    let response = null;

    if (disabled) {

        const reply = await interaction.fetchReply();

        reply.edit({
            "content": "**Events**",
            "components": rows,
            "fetchReply": true
        });

        return;

    } else if (interaction.isApplicationCommand()) {

        response = await interaction.reply({
            "content": "**Events**",
            "components": rows,
            "fetchReply": true
        });
    
    } else {

        response = await interaction.update({
            "content": "**Events**",
            "components": rows,
            "fetchReply": true
        });

    }

    response.awaitMessageComponent({
        "componentType": "BUTTON",
        "time": 60000,
        "filter": (inter) => inter.user === interaction.user
    })
        .then(async (buttonInteraction) => {
            
            model[buttonInteraction.customId] = !model[buttonInteraction.customId];

            const newModel = await model.save();

            event_subscription(buttonInteraction, newModel);
        
        })
        .catch((error) => {

            if (error.code === "INTERACTION_COLLECTOR_ERROR") {

                event_subscription(interaction, model, true);
            
            } else {

                console.error(error);
            
            }
            
        
        });


}
