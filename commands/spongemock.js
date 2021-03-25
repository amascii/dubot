const Discord = require('discord.js');

module.exports = {
    name: 'spongemock',
    description: 'Mocks last message sent',
    aliases: ['sm'],
    args: true,
    usage: '<user>',
    execute(message) {
        mock = text => text.split('').map( e => Math.random() >= .5 ? e.toUpperCase() : e.toLowerCase()).join('');
        
        const user = message.mentions.users.first();
        const msgCache = message.channel.messages.cache;

        let msgKeys = Array.from(msgCache.keys());
        if (user == message.author) { // if mocking self, mocks penultimate message, not mock command
            msgKeys.pop();
        }
        msgKeys.reverse();

        const lastMsgKey = msgKeys.find(key => msgCache.get(key).author === user);
        const reply = mock(msgCache.get(lastMsgKey).content);

        const mockEmbed = new Discord.MessageEmbed()
            .setDescription(`<@${user.id}>: ${reply}`)
            .setThumbnail('https://raw.githubusercontent.com/ajcrites/spongemock/master/sPoNgEBoB.jpg');

        message.channel.send(mockEmbed);
    },
}