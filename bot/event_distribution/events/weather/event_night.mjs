import {MessageEmbed} from "discord.js";
import {send_channels} from "../../send_events.mjs";

// eslint-disable-next-line no-unused-vars
import {event_flags, get_events, get_game} from "../../../util/game.mjs";
import {emoji_string} from "../../../util/team.mjs";

export const eventList = [event_flags.NIGHT_NIGHT_SHIFT];


/**
 * incinerations
 * @param {Object} event
 */
export async function eventFunction (event) {

    const game = await get_game(event.gameTags[0]);

    const embed = new MessageEmbed()
        .setColor("NOT_QUITE_BLACK")
        .setDescription(`**${event.description}**`)
        .setAuthor("Night", "https://www.blaseball.wiki/images/0/03/Weather_night.png", "https://www.blaseball.wiki/w/Night")
        .setFooter(`Day ${game.day + 1} of season ${event.season + 1}${
            game.sim !== "thisidisstaticyo" ? ` of ${game.sim}` : ""}, ${emoji_string(game.awayTeamEmoji,true)} @ ${emoji_string(game.homeTeamEmoji,true)}`);

    send_channels({"sub_weather": true}, {"embeds": [embed]});

}
