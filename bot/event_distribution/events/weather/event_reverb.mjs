import {MessageEmbed} from "discord.js";
import {send_channels} from "../../send_events.mjs";

// eslint-disable-next-line no-unused-vars
import {event_flags, get_events, get_game} from "../../../util/game.mjs";
import {emoji_string} from "../../../util/team.mjs";

export const eventList = [
    event_flags.REVERB_FULL,
    event_flags.REVERB_LINEUP,
    event_flags.REVERB_ROTATION,
    event_flags.GAINING_REVERBERATING
];


/**
 * incinerations
 * @param {Object} event
 */
export async function eventFunction (event) {

    const game = await get_game(event.gameTags[0]);

    
    const embed = new MessageEmbed()
        .setColor("#61b3ff")
        .setDescription(`**${event.description}**`)
        // eslint-disable-next-line max-len
        .setAuthor("Reverb", "https://www.blaseball.wiki/images/thumb/8/8f/Tgb_reverb.png/599px-Tgb_reverb.png", "https://www.blaseball.wiki/w/Reverb")
        .setFooter(`Day ${game.day + 1} of season ${event.season + 1}${
            game.sim !== "thisidisstaticyo" ? ` of ${game.sim}` : ""}, ${emoji_string(game.awayTeamEmoji,true)} @ ${emoji_string(game.homeTeamEmoji,true)}`);


    send_channels({"sub_weather": true}, {"embeds": [embed]});

}
