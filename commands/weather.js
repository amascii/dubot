const axios = require('axios');
const Discord = require('discord.js');
const { openWeatherApiKey } = require('../config.json');

const instance = axios.create({
	baseURL: 'https://api.openweathermap.org/data/2.5',
	timeout: 1000
});

module.exports = {
	name: 'weather',
	description: 'get weather',
	args: true,
	aliases: ['w'],
	usage: '<city name>',
	execute(message, args) {
		let units = 'metric'
		let cityName = args.join(' ')

		instance.get('/weather', {
			params: {
				apikey: openWeatherApiKey,
				q: cityName,
				units: units
			}
		})
			.then(function (response) {
				let weatherData = response.data
				const weatherReport = new Discord.MessageEmbed()
					.setDescription(`in ${weatherData.name}, ${weatherData.sys.country}`)
					.setTitle(`${weatherData.main.temp.toFixed(1)}°C`)
					.addFields(
						{name: 'Feels like', value: `${weatherData.main.feels_like.toFixed(1)}°C`},
						{name: 'Humidity', value: `${weatherData.main.humidity}%`}
					)
					.setThumbnail(getWeatherImageFromCode(weatherData.weather[0].id));
				// console.log(weatherData)
            	message.channel.send(weatherReport);
			})
			.catch(function (error) {
				message.channel.send('Something went wrong!')
				console.log(error);
			})
	},
};

function between(number, lowerBound, upperBound) {
	return lowerBound <= number && number <= upperBound
}

function getWeatherImageFromCode(code) {
	if (between(code, 200, 232)) return 'http://openweathermap.org/img/wn/11d@2x.png'
	else if (between(code, 300, 321)) return 'http://openweathermap.org/img/wn/09d@2x.png'
	else if (between(code, 500, 531)) return 'http://openweathermap.org/img/wn/09d@2x.png'
	else if (between(code, 600, 622)) return 'http://openweathermap.org/img/wn/13d@2x.png'
	else if (between(code, 701, 781)) return 'http://openweathermap.org/img/wn/50d@2x.png'
	else if (code == 800) return 'http://openweathermap.org/img/wn/01d@2x.png'
	else if (between(code, 801, 804)) return 'http://openweathermap.org/img/wn/03d@2x.png'
	else return 'http://openweathermap.org/img/wn/03d@2x.png'
}