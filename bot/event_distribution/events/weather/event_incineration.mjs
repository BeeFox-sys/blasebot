import {MessageEmbed} from "discord.js";
import {event_flags, get_events, get_game} from "../../../util/game.mjs";
import {emoji_string} from "../../../util/team.mjs";
import {send_channels} from "../../send_events.mjs";


export const eventList = [
    event_flags.INCINERATION_BLOCKED,
    event_flags.INCINERATION
];


/**
 * incinerations
 * @param {Object} event
 */
export async function eventFunction (event) {
    
    // This one is pretty easy to set up!

    let siblings = [];


    if (event.metadata?.siblingIds?.length) {

        siblings = await get_events(event.metadata.siblingIds);

    }

    const game = await get_game(event.gameTags[0]);


    const embed = new MessageEmbed()
        .setColor("WHITE")
        .setDescription(`**${event.description}**\n${siblings[4]?.description ?? ""}`)
        // eslint-disable-next-line max-len
        .setAuthor("Solar Eclipse", "https://www.blaseball.wiki/images/thumb/5/51/Tgb_eclipse.png/60px-Tgb_eclipse.png", "https://www.blaseball.wiki/w/Solar_Eclipse")
        .setFooter(`Day ${game.day + 1} of season ${game.season + 1}${
            game.sim !== "thisidisstaticyo" ? ` of ${game.sim}` : ""}, ${emoji_string(game.awayTeamEmoji,true)} @ ${emoji_string(game.homeTeamEmoji,true)}`);


    send_channels({"sub_incineration": true,
        "sub_weather": true}, {"embeds": [embed]});

}
