const fs = require('fs');

// require the discord.js module
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');

// create a new Discord client
const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.name, command);
}

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', message => {
    // say thanks!
    if (message.content.includes('good bot')) {
        message.react('🥰');
    } 

    // or curse them
    if (message.content.includes('bad bot')) {
        message.react('🤬');
    } 

    // ignore if message doesn't have prefix or author is a bot
    if (!message.author.bot && (message.content.toLowerCase().includes('game') || message.content.toLowerCase().includes('juego') )) {
        message.reply('lost the game!');
    }
    console.log(message.author.username)

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // extract command + args
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));;

    // check if valid command
    if (!command) return;

    // check if guild only command
    if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply('I can\'t execute that command inside DMs!');
    }

    // check if attachments command
    if (command.attachments && !message.attachments.size) {
        return message.reply('You should attach something!');
    }

    // if command requires args, but no args given
    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    // execute command
    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }

    // if (command === 'avatar') {
    //     if (!message.mentions.users.size) {
    //         return message.channel.send(`Your avatar: <${message.author.displayAvatarURL({ format: "png", dynamic: true })}>`);
    //     } else {
    //         x = message.mentions.users.map((user) => {
    //             return `<${user.displayAvatarURL({ format: "png", dynamic: true })}>\n`;
    //         });
    //         return message.channel.send(x.join(""));
    //     }
    // }
});

// login to Discord with app's token
client.login(token);