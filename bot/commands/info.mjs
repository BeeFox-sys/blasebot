import {SlashCommandBuilder, CommandInteraction, EmbedBuilder, PermissionsBitField} from "discord.js";

export const commandData = new SlashCommandBuilder()
    .setName("info")
    .setDescription("Provides info about blasebot");

/**
 *
 * @param {CommandInteraction} commandEvent
 */
export async function commandFunction (commandEvent) {

    const embed = new EmbedBuilder()
        .setAuthor({
            "name": "Beefox",
            // eslint-disable-next-line max-len
            "iconURL": "https://cdn.discordapp.com/avatars/178116262390398976/834d281174a4acf6d96fcb7a1861a7cd.webp",
            "url": "https://beefox.xyz"
        })
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
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.EmbedLinks,
            PermissionsBitField.Flags.UseExternalEmojis,
            PermissionsBitField.Flags.UseApplicationCommands
        ]
    })
})
`.trim())
        .addFields({
            "name": "Support",
            "value": "Blasebot is run by Beefox, a disabled and queer programer. Server costs are covered by SIBR, to whom you can [donate on patreon](https://www.patreon.com/sibr). If you like what star has done with this bot, [there are many ways to donate to star](https://beefox.xyz/contact)."
        })
        .setColor("#eeaa66");

    commandEvent.reply({
        "embeds": [embed]
    });

}
