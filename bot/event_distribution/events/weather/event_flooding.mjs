import {MessageEmbed} from "discord.js";
import {send_channels} from "../../send_events.mjs";

// eslint-disable-next-line no-unused-vars
import {event_flags, get_events, get_game} from "../../../util/game.mjs";
import {emoji_string} from "../../../util/team.mjs";


export const eventList = [event_flags.BASERUNNERS_SWEPT];


/**
 * incinerations
 * @param {Object} event
 */
export async function eventFunction (event) {

    const game = await get_game(event.gameTags[0]);

    
    const embed = new MessageEmbed()
        .setColor("#8cb8ad")
        .setDescription(`**${event.description}**`)
        // eslint-disable-next-line max-len
        .setAuthor("Flooding", "https://www.blaseball.wiki/images/thumb/2/29/Tgb_flooding.png/600px-Tgb_flooding.png", "https://www.blaseball.wiki/w/Flooding")
        .setFooter(`Day ${game.day + 1} of season ${game.season + 1}${
            game.sim !== "thisidisstaticyo" ? ` of ${game.sim}` : ""}, ${emoji_string(game.awayTeamEmoji)} @ ${emoji_string(game.homeTeamEmoji)}`);


    send_channels({"sub_weather": true}, {"embeds": [embed]});

}
