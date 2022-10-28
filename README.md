# Blasebot
---
A Discord bot for [Blaseball](https://www.blaseball.com/).

## Features

(this section is being rewritten)

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

## Contributing

When contributing, be aware of current versions. develop is for new features, main is live. all new features need to be tested before moving to main.

Semantic Versioning Guide:
Small changes like minor bug fixes and new weather events: Patch
New Features: Minor
Rewrites: Major