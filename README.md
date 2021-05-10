# Blasebot
---
A Discord bot for [Blaseball](https://www.blaseball.com/).

## Features

* Game lookup (`/lookup day [season] [day] <team playing>`)
* Player lookup (`/lookup player [full name]`)
* Team lookup (`/lookup team [team name]`)
* Game score updates (`/subscribe scores [team]`)
* Game summaries (`/subscribe summaries [team]`)
* Event subscription (`/subscribe events`)
* End-of-game betting reminders (`/subscribe bets`)

## Game Scores

Game score update subscription allows you to have scoring plays for all games that a specific team play be sent directly to a channel of your choice. You can enable this by using `/subscribe scores [team]`. If you wish to stop having this information sent to a channel, you can use `/unsubscribe scores [team]`. You may only have scores for one team sent to a channel, and you cannot have a given team's scores be sent to multiple channels.

## Game Summaries

Game summaries are similar to score update subscriptions. When a game ends, a score card – the same style that is generated with game lookups – will be sent to the subscribed channel. Unlike game score subscriptions, you may have multiple teams' summaries sent to the same channel. You can subscribe to summaries using `/subscribe summaries [team]` and unsubscribe with `/unsubscribe summaries [team]`.

## Privacy

No personal data is stored in the database, only channel IDs, guild IDs, and the IDs of any blaseball teams are stored.

## Forbidden Knowledge

Warning! This code contains some forbidden knowledge, which can demystify the game of blaseball. Look at the code at your own risk!

## Invite Bot

You can invite Blasebot to your server using [this link](https://discord.com/oauth2/authorize?client_id=749154634370646067&scope=bot%20applications.commands&permissions=18432). This link is also shown by using the bot's `/info` command.

## Running the bot

### With Docker
To run the bot with docker, firstly you must copy `sample.env` to `.env` and fill in the relevant fields, docker will override `dbUrl` so you do not need to worry about that one! After that, you can simply run `docker-compose up --build`, this will start the container.

### Without Docker
If you wish to run the bot without docker, you will need to use Node 14.5.0 minimum. To run the bot make sure to run `npm install` to install all packages. You can then configure a file named `config.json` at the top level of the directory. See `sample.config.json` for how to configure the bot. Once the config file has been created, run `node command-json/updateCommands` from the top directory to register the bot's slash commands with Discord.
Blasebot uses a Mongoose database to store subscriptions – if you are running the bot locally, leave [MongoDB](https://www.mongodb.com/try/download/community) (`mongo`) running in the background before starting up the bot.

Once everything is set up, you can run Blasebot with `node bot/main` from the top directory.
