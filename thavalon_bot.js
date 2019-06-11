// Node dependencies.
const Discord = require('discord.js');
const axios = require('axios');

// Object which interacts with the discord API
const client = new Discord.Client();

const url = "http://www.thavalon.com";

//Map of Game ID to proposal order, information
const gameToOrder = {};

//Map of Channel ID to Game ID
const channelToGame = {};


// Sends the help string  gets sent when help is called
const help = (message, args) => {
    const helpString = "!creategame <players>: creates a new game with the players with the specified nicknames." +
        "Currently doesn't support names with whitespace. \n !order: prints out the order of current game";
    message.channel.send(helpString);
};th

/**
 * Creates a new game, by querying the Thavalon API.
 * @param message message rec
 * @param args
 */
 const createGame = (message, args) => {

    args.forEach(name => {message.channel.members.find(user => user.nickname === name)});

    if (args.length !== 7 && args.length !== 5 && args.length !== 8) {
        message.channel.send("Invalid game size");
        return;
    }

    // Posts the names to the THavalon server to roll a new game
    axios.post(url + '/names', {
     names: args})
        .then(response => response.data)
        .then(data => {

            // The server responds with the game ID
            const id = data.id;

            // Records the game associated with the channel.
            channelToGame[message.channel.id] = id;

            // Comment this in to create new game channels
            // message.guild.createChannel("Game " + id, {type: "voice"});
            // message.guild.createChannel("Game " + id, {type: "text"});

            // Posts to the server to get the info for this game
            axios.get(url + '/game/info/'+ id)
                .then(response => response.data)
                .then(data => {

                    // Records the order & info for this game id
                    gameToOrder["id"] = {order: data.map(ele => ele.name), info: data};

                    //Sends the order info to the whole channel
                    message.channel.send( gameToOrder["id"].order);

                    // Sends each user their data
                    data.forEach(ele => {

                        // Looks for the user in the channel
                        const user = message.channel.members.find(i => i.nickname === ele.name) ;

                        // If user is found, sends them their info
                        if (user) {
                            user.send("\n~~~~~~~~~~~~~~ NEW GAME ~~~~~~~~~~~~~~");
                            user.send("You are " + ele.role);
                            user.send(ele.description);
                            let infoString = "";
                            const info = JSON.parse(ele.information);

                            // Parses each info array seperately. Someone better at js could probably do this
                            // in one line
                            info.alerts.forEach(ele => {
                                infoString += ele + "\n";
                            });

                            info.rolePresent.forEach(ele => {
                                infoString += ele + "\n";
                            });

                            info.perfect.forEach(ele => {
                                infoString += ele + "\n";
                            });

                            info.seen.forEach(ele => {
                                infoString += ele + "\n";
                            });
                            info.pairSeen.forEach(ele => {
                                infoString += ele + "\n";
                            });

                            console.log(infoString);
                            if (infoString !== "") {
                                user.send(infoString)
                            }

                        } else {
                            //Sends an error message if no user found
                            message.channel.send("User " + ele.name + " not found");
                        }
                    })
                    }
                )
        })



}

/**
 * Sends the order based on the channel ID
 * @param message
 * @param args
 */
const sendOrder = (message, args) => {
    const id = channelToGame[message.channel.id];
    message.channel.send(gameToOrder[id].order);
};

const secretPoll = (message, names) => {
    let users = [];
    names.forEach(ele => {
        const user = message.channel.members.find(i => i.nickname === ele || i.displayName === ele);

        if (!user) {
            message.channel.send("Error: not all users exist");
            return;
        }
        users.push(user)
    });

    let votes = [];
    users.forEach(user => {
        user.send("You've been added to a mission vote. Please enter your vote");
        const collector = new Discord.MessageCollector(user, { time: 100000 });

        collector.on('collect', message => {
            console.log(message.content);
            votes.push(message.content);
            if (votes.length === users.length) {
                message.channel.send(votes.toString());

            }
        })
    })
};

/*
 Map which  stores all possible commmands. Commands can be added by using a keyword.
 Commands are pure first-order functions which take in two arguments: message -> the message
 which triggered the function, and args -> a list of the arguments taken by the command
 */
const commandMap = {
    "help" : help,
    "creategame": createGame,
    "mission": secretPoll,
    "order": sendOrder
};


//Regex which looks for a command tag (!), then captyres
const commandRegex = new RegExp("^.*?!(\\w*)\\s*(.*)$");

/*
 * Waits for client connect. Prints all guilds to which this bot is a member
 */
client.on('ready', () => {
    console.log("Connected as " + client.user.tag);

    console.log("Servers:");
    client.guilds.forEach((guild) => {
        console.log(" - " + guild.name);
        guild.channels.forEach((channel) => {
            console.log(` -- ${channel.name} (${channel.type}) - ${channel.id}`)
        });
    })
});

/*
 * Responds to a message from the Discord webhook by forwarding it to the proper command.
 */
client.on('message' , (message) => {
    if (message.author === client.user) {
        return;
    }
    const commandInfo = commandRegex.exec(message.content);
    if (commandInfo) {
        console.log(commandInfo[1]);
        if (commandInfo[1] in commandMap) {
            commandMap[commandInfo[1]](message, commandInfo[2].split(" "));

        }
    }
});



//lmao
bot_secret_token = "NTg2NTk3ODgyMTAzMzMyODk0.XPviAw.h0dsQushs3NnmbWsiLEVYU5f5As";

client.login(bot_secret_token);


