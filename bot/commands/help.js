const command = {
    name: "help",
    aliases: [],
    description: "displays a list of commands, do help [command] for that commands description",
    async execute(message, args) {
        if(args.length){
            //Looking up a command
            let command = message.client.commands.get(args[0]);
            if(!command) return message.channel.send("There is no command with the name "+args[0]);

        } else {
            //Listing commands

            let commands = message.client.commands.map(c => c.name);
            let commandList = `Command list:\n${message.client.config.prefix}`;+commands.join(`\n${message.client.config.prefix}`);
            return message.channel.send(commandList)+"\n*You can use bb!help [command name] to see the description of a command";
        }
    },
};

module.exports = command;