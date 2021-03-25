const Discord = require('discord.js');
const Twitter = require('twitter');
const { twitter_consumer_key, twitter_consumer_secret, twitter_access_token_key, twitter_access_token_secret } = require('../config.json');

module.exports = {
    name: 'randomimage',
    description: 'Sends a random image',
    aliases: ['ri'],
    args: true,
    usage: '<twitter handle>',
    execute(message, args) {
        const handle = args[0]
        const count = 200;

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

        const sendRandomImage = imgs => {
            console.log('imgs: ' + imgs.length);
            const rndImg = imgs[Math.floor(Math.random() * imgs.length)];
            const bwEmbed = new Discord.MessageEmbed().setImage(rndImg).setDescription(`Randomly chosen from ${imgs.length} images`);
            message.channel.send(bwEmbed);
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
            console.log((t1-t0) + 'ms');
            sendRandomImage(links);
        };

        
        loadLinks();
    },
}