import {SlashCommandBuilder} from "@discordjs/builders";

export const commandData = new SlashCommandBuilder()
    .setName("info")
    .setDescription("Provides info about blasebot");


// eslint-disable-next-line no-unused-vars
import {CommandInteraction, MessageEmbed, PermissionsBitField} from "discord.js";


/**
 *
 * @param {CommandInteraction} commandEvent
 */
export async function commandFunction (commandEvent) {

    const embed = new MessageEmbed()
        .setAuthor(
            "Beefox",
            // eslint-disable-next-line max-len
            "https://cdn.discordapp.com/avatars/178116262390398976/834d281174a4acf6d96fcb7a1861a7cd.webp",
            "https://beefox.xyz"
        )
        .setTitle("Blasebot")
        .setDescription(`
Blasebot is a Blaseball reporting discord bot.
It allows you to pick certain events to report on, such as weather, incinerations, entities speaking, and more.
Blasebot allows users to follow the adventure of Blaseball, from the comfort and community of their own discord server!
If you wish to invite blasebot to your server, so you too may participate in the cultural event of Blaseball in discord, simply [click here to invite blasebot](${
    commandEvent.client.generateInvite({
        "scopes": [
            "bot",
            "applications.commands"
        ],
        "permissions": [
            PermissionsBitField.FLAGS.ViewChannel,
            PermissionsBitField.FLAGS.SendMessages,
            PermissionsBitField.FLAGS.EmbedLinks,
            PermissionsBitField.FLAGS.UseExternalEmojis,
            PermissionsBitField.FLAGS.UseApplicationCommands
        ]
    })
})
`.trim())
        .addField("Support", "Blasebot is run by Beefox, a disabled and queer programer. Server costs are mostly covered by star, however if you wish to help out you can [donate on liberapay](https://liberapay.com/beefox/), a patreon like service with no fees.")
        .setColor("#eeaa66");

    commandEvent.reply({
        "embeds": [embed]
    });

}
