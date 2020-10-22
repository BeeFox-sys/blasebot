const fs = require("fs");
const Discord = require("discord.js");
const { performance } = require("perf_hooks");
const client = new Discord.Client({disableMentions:"all"});
client.config = require("../config.json");
client.mode = 0;
require("./stats");
global.client = client;
const { messageError } = require("./util/miscUtils");

console.log("Loading commands...");
let commandLoadStart = performance.now();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync("./bot/commands").filter(file => file.endsWith(".js"));
let loadedCommands = 0;

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
    for(const alias of command.aliases){
        client.commands.set(alias, command);
    }
    loadedCommands++;
}
let commandLoadEnd = performance.now();
console.log(`Loaded ${loadedCommands} commands in ${Math.ceil(commandLoadEnd-commandLoadStart)}ms!`);
const {updateTeamCache} = require("./blaseball-api/teams");
const { updatePlayerCache } = require("./blaseball-api/players");
async function initCaches(){
    await updateTeamCache();
    await updatePlayerCache();
}
require("./gameUpdates");

//setup Mongoose
const Mongoose = require.main.require("mongoose");
const process = require("process");
const { exit } = require("process");
Mongoose.connect(process.env.DB_URL || client.config.dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});
Mongoose.connection
    .on("error",(error)=>{console.error(error); exit();})
    .once("open", function () {
        console.log("Connected to database");
        console.log("Initaliszing Caches"); 
        initCaches().then(()=>{
            console.log("Connecting to discord...");
            client.login(client.config.discordToken);
        });        
    });
// Client Ready
client.once("ready", () => {
    console.log(`Ready! Serving ${client.guilds.cache.size} blaseball communities!`);
    console.log("The commissioner is doing a great job");
    if(client.mode == 1){
        client.user.setActivity("the waiting game | Can't connect to blasball :c");
    } else {
        client.user.setActivity("Crystal Clear Blaseball! | bb!help");
    }
});

client.setInterval(()=>{
    if(client.mode == 1){
        client.user.setActivity("the waiting game | Can't connect to blaseball :c");
    } else {
        client.user.setActivity("Blaseball! | bb!help");
    }
}, 300000);

// Command Handler
client.on("message", async (message) => {

    //Don't bother processing these types of messages
    if(message.author.bot) return;
    if(message.guild && !message.channel.permissionsFor(client.user).has("SEND_MESSAGES")) return;


    //Check to see that we are actually being asked to do something
    let messageContent;
    if(message.content.startsWith(client.config.prefix)){
        messageContent = message.content.substring(client.config.prefix.length);
        if(!messageContent.length) return;
    } else return;

    if(client.mode == 1) return message.channel.send("I can't reach blaseball right now :c").catch(messageError);
    if(client.mode == 3) return message.channel.send("I am currently doing some Blaseball research, try again in a minute c:").catch(messageError);

    //Get args
    let args = messageContent.split(/\s/);
    let commandName = args.shift();

    //Get Command
    let command = client.commands.get(commandName);

    if(command?.root && args.length > 0){
        commandName += " "+args.shift();
        command = client.commands.get(commandName);
    }

    if(!command) return message.channel.send(commandName+" is not a command!").catch(messageError);

    //Run Command
    try {
        global.stats.commandFreq.mark();
        command.execute(message, args);
    } catch (error) {
        message.channel.send("Error! Something went wrong!").catch(messageError);
        console.error(error);
        return;
    }

});

client.on("rateLimit",(e)=>{
    console.error(e);
    global.stats.ratelimit.inc();
});