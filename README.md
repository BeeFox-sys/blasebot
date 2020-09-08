# Blasebot
---
A discord bot for blaseball

## Features

* Game lookup (`bb!game [season] [day] [team playing]`)
* Player lookup (`bb!player [full name]`)
* Team lookup (`bb!team [team name, nickname, or emoji]`)
* Game subscription (`bb!subscribe [team]`)
* Game summaries (`bb!summarize [team]`)
* Game score updates (`bb!scores [team]`)
* Game score updates compact mode (`bb!compact [team]`)

## Game Subscription

Game subscription allows you to have plays and score for all games a team play sent directly to a channel of your choice. You can allow this by using `bb!subscribe [team]`. If you wish to stop having this information sent to a channel, you can use `bb!unsubscribe`. You may only have information for one team sent to a channel, and you cannot have a teams information sent to multiple channels.

## Game Summaries

Game summaries are similar to subscriptions. When a game ends, a score card will be sent to the selected channel, this is the same card generated with game lookups. Unlike subscriptions, you may have multiple teams summaries sent to the same channel. You can subscribe to summaries using `bb!summarize [team]` and unsubscribe with `bb!unsummarize [team]`.

## Game Scores

Game scores are also similar to subscriptions, only giving updates on scoring plays. You can subscribe to score updates using `bb!scores [team]` and unsubscribe with `bb!unscores [team]`. If you want a more compact version, use `bb!compact[team]` and `bb!uncompact[team]`.

## Privacy

No personal data is stored in the database, only channel IDs, guild IDs, and the ID of any teams are stored.

## Forbidden Knowledge

Warning! This code contains some forbidden knowledge, forbidden knowledge can demystify the game of blaseball. Look at the code at your own risk!

## Invite Bot

You can invite blasebot to your guild using [this link](https://discord.com/oauth2/authorize?client_id=749154634370646067&scope=bot&permissions=18432)

## Running the bot

If you wish to run the bot yourself, you will need to use node 14.5.0 minimum. To run the bot make sure to run `npm install` to install all packages. You can then configure a file named `config.json` at the top level of the directory. See `sample.config.json` for how to configure the bot.
Blaseball uses a mongoose database to store subscriptions and summaries.
Once everything is set up, you can run blaseball with `node bot/main` from the top directory.