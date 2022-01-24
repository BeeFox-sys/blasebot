import {SlashCommandBuilder} from "@discordjs/builders";

export const commandData = new SlashCommandBuilder()
    .setName("debug")
    .setDescription("debugs blasebot")
    .setDefaultPermission(false)
    .addSubcommand((subcommand) => subcommand
        .setName("event")
        .setDescription("debugs a specific event")
        .addStringOption((stringOption) => stringOption
            .setName("event_id")
            .setDescription("event to processs")
            .setRequired(true)));


// eslint-disable-next-line no-unused-vars
import {CommandInteraction} from "discord.js";

import {event_sorting} from "../event_distribution/event_distributor.mjs";
import {get_events} from "../util/game.mjs";

/**
 *
 * @param {CommandInteraction} commandEvent
 */
export async function commandFunction (commandEvent) {

    await commandEvent.deferReply();
    const events = await get_events(commandEvent.options.getString("event_id").split(","));

    console.log(events);

    await event_sorting(events, true);

    commandEvent.editReply({
        "content": `Debuged event ${commandEvent.options.getString("event_id")}`
    });

}
