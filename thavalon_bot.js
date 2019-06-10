const Discord = require('discord.js');
const client = new Discord.Client();

const axios = require('axios');
const url = "http://www.thavalon.com";
const help = (message, args) => {
    message.channel.send("Help recieved")
};

let order = "";
function createGame(message, args) {
    console.log(args);

    args.forEach(name => {message.channel.members.find(user => user.nickname === name)});

    if (args.length !== 7 && args.length !== 5 && args.length !== 8) {
        message.channel.send("Invalid game size");
        return;
    }


    axios.post(url + '/names', {
     names: args})
        .then(response => response.data)
        .then(data => {
            const id = data.id;
            message.guild.createChannel("Game " + id, {type: "voice"});
            message.guild.createChannel("Game " + id, {type: "text"});

            console.log("here");
            axios.get(url + '/game/info/'+ id)
                .then(response => response.data)
                .then(data => {
                    console.log(data);
                    order = data.map(ele => ele.name);
                    message.channel.send(order);
                    data.forEach(ele => {
                        const user = message.channel.members.find(i => i.nickname === ele.name || i.displayName === ele.name) ;
                        if (user) {
                            user.send("~~~~~~~~~~~~~~ NEW GAME ~~~~~~~~~~~~~~");
                            user.send("You are " + ele.role);
                            user.send(ele.description);
                            let infoString = "";
                            const info = JSON.parse(ele.information);
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

                        }
                    })
                    }
                )
        })



}

sendOrder = (message, args) => {
    message.channel.send(order);
};

secretPoll = (message, names) => {
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

const commandMap = {
    "help" : help,
    "creategame": createGame,
    "mission": secretPoll,
    "order": sendOrder
};

const commandRegex = new RegExp("^.*?!(\\w*)\\s*(.*)$");

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






bot_secret_token = "NTg2NTk3ODgyMTAzMzMyODk0.XPviAw.h0dsQushs3NnmbWsiLEVYU5f5As";

client.login(bot_secret_token);


