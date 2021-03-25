const Discord = require('discord.js');
const Twitter = require('twitter');
const { twitter_consumer_key, twitter_consumer_secret, twitter_access_token_key, twitter_access_token_secret } = require('../config.json');

const emojiNext = '➡'; // unicode emoji are identified by the emoji itself
const emojiPrevious = '⬅️';
const seconds = 60;

// let list = [] //Se declara la lista de las weas
// function getList(i, n) {
//     i = mod(i, n);
//     return list[i].setTimestamp().setFooter(`${i + 1} of ${n}`);
// }
const getList = (i, n) => {
    i = mod(i, n);
    return list[i].setTimestamp().setFooter(`${i + 1} of ${n}`);
}

// const getList = (i, n) => {
//     //i = mod(i, n);
//     list[i].setTimestamp().setFooter(`${mod(i,n) + 1} of ${n}`);
// }

const mod = (n, m) => ((n % m) + m) % m;


module.exports = {
    name: 'gallery',
    description: 'Gallery',
    aliases: ['g'],
    args: true,
    usage: '<twitter handle>',
    execute(message, args) {
        const handle = args[0]
        const count = 200;

        // twitter credentials
        const client = new Twitter({
            consumer_key: twitter_consumer_key,
            consumer_secret: twitter_consumer_secret,
            access_token_key: twitter_access_token_key,
            access_token_secret: twitter_access_token_secret
        });

        const getMediaLinks = tweets => {
            const tweetsWithMedia = tweets.filter(tweet => typeof tweet['extended_entities'] != 'undefined');
            const mediaList = tweetsWithMedia.map(tweet => tweet['extended_entities']['media']);
            const linkList = mediaList.flatMap(media => media.map(img => img['media_url_https']));
            return linkList.filter(link => link.includes('media')); // get rid of external video thumbnails
        }

        const sendGallery = imgs => {
            list = imgs.map(img => new Discord.MessageEmbed().setTitle(`${handle}'s media`).setImage(img))

            message.channel.send(list[0]) //Envia el primer elemento de la lista
                .then(async function (message) {
                    // ACA ES DONDE CHECA SI ES ADELANTE O ATRAS
                    await message.react(emojiPrevious);
                    await message.react(emojiNext);

                    const filter = (reaction, user) => user.id !== message.author.id;
                    const collector = message.createReactionCollector(filter, { time: seconds * 1000 });
                    var i = 0
                    collector.on('collect', (reaction, user) => {
                        //console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
                        if (reaction.emoji.name === emojiPrevious) message.edit(getList(--i, imgs.length));
                        else if (reaction.emoji.name === emojiNext) message.edit(getList(++i, imgs.length));
                    });
                })

        }

        const getTimeline = max_id =>
            max_id == null ?
                new Promise(resolve => client.get('statuses/user_timeline', { screen_name: handle, count: count, trim_user: 1 }).then(tweets => resolve(tweets))) :
                new Promise(resolve => client.get('statuses/user_timeline', { screen_name: handle, count: count, trim_user: 1, max_id: max_id }).then(tweets => resolve(tweets)));

        async function loadLinks() {
            t0 = Date.now();

            let max_id = null;
            let links = [];
            let isDone = false;

            while (!isDone) {
                let timeline = getTimeline(max_id);

                await timeline.then(tweets => {
                    // remove first tweet if next batch (redundant)
                    if (max_id) tweets.shift();
                    let newLinks = getMediaLinks(tweets);
                    links.push(...newLinks);

                    isDone = true;

                    // stop loop if no more tweets
                    if (typeof tweets == 'undefined' || tweets.length == 0)
                        //if (tweets.length < count - 1) 
                        isDone = true;
                    else {
                        // update max_id
                        let [lastTweet] = tweets.slice(-1);
                        max_id = lastTweet['id_str'];
                    }
                });
            }
            t1 = Date.now();
            console.log((t1 - t0) + 'ms');
            sendGallery(links);
        };

        loadLinks();
    },
}

