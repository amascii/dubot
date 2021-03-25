module.exports = {
    name: 'server-info',
    description: 'Get server and user info',
    guildOnly: true,
    execute(message) {
        // const loginMessageList = ['Hullo!', 'Hallo!', 'Bonjour!', 'こんにちは！', '안녕하세요!'];
        const numOfBots = message.channel.guild.members.cache.filter(member => member.user.bot).size;

        const reply = (
            `Server name: ${message.guild.name}\n` +
            `Total members: ${message.guild.memberCount} (${message.guild.memberCount - numOfBots} humans and ${numOfBots} bots)\n`
            //`${loginMessageList[Math.floor(Math.random() * loginMessageList.length)]}\n` +
            //`Your username: ${message.author.username}\n` +
            //`Your ID: ${message.author.id}`
        );
        message.channel.send(reply);
    },
};