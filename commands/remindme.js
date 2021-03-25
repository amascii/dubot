const chrono = require('chrono-node');

module.exports = {
    name: 'remindme',
    description: 'Reminds you of something after specified time',
    aliases: 'rm',
    usage: '<reminder>',
    args: true,
    execute(message, args) {
        const now = new Date();

        // parse message
        const reminder = args.join(' ');
        const parsedResult = chrono.parse(reminder);
        let timeout = null;
        if (Object.keys(parsedResult).length === 0) {
            console.log('parsing error!');
            message.react('❌');
            return;
        } else {
            timeout = parsedResult[0].start.date();
        }
        
        // calculate millisecond diff
        const diff = timeout.valueOf() - now.valueOf();
        message.react('✅');
    
        // set reminder
        setTimeout(() => {
            message.channel.send(`Yo, <@${message.author.id}>! Here's your reminder:\n> ` + reminder);
        }, diff);
    },
}