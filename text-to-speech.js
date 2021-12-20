// Imports the Google Cloud client library
const textToSpeech = require('@google-cloud/text-to-speech')
const Discord = require('discord.js')
const fs = require('fs')
const util = require('util')
const bot = new Discord.Client()

require('dotenv').config()

const apiKeys = {
	discord: process.env.DISCORD_BOT_API
}

function getUserMessage(context, username) {
	const userMessages = {
		default: 'hva så motherfucker',
		welcome: {
			wiuf: 'Er I klar til at tabe? Planetens største woke klunke er joinet.',
			jacob: 'jacobo vil spille',
			lbenediktson: 'lukas den største champion',
			piaerbillig: 'albino bertram',
			socialakavet: 'jimmy joint in the house',
			default: `hva så ${username}, du stadig en fucking bums!`
		}
	}
	
	return userMessages[context][username] ||
		   userMessages[context].default ||
		   userMessages.default
}

bot.login(apiKeys.discord)

bot.on('ready', () => console.log('logged ind'))

const playAudio = async (channelID, username) => {
	const channel = bot.channels.cache.get(channelID)
	const userAudioPath = `./users/welcome/${username}.mp3`

	channel
		.join()
		.then((connection) => {
			// const dispatcher = connection.play(`./users/welcome/wiuf.mp3`) // DEV
			console.log({userAudioPath})
			const dispatcher = connection.play(userAudioPath) // PROD
			dispatcher.on('start', () => {
				console.log('audio is now playing from: ' + userAudioPath)
			})
			dispatcher.on('finish', () => {
				console.log('audio has finished playing')
				connection.disconnect()
			})
			dispatcher.on('error', (err) => {
				console.log('fejl på linje 32 [playAudio]:', err)
			})
		})
		.catch((err) => {
			console.log('Error in [playAudio]:', err)
			connection.disconnect()
		})
}

const createAndPlayAudio = (username, channelID) => {
	// Creates a client
	const client = new textToSpeech.TextToSpeechClient()
	let speechResponse
	quickStart()
	async function quickStart() {
		// The text to synthesize
		let text = getUserMessage('welcome', username)

		// Construct the request
		const request = {
			input: { text: text },
			voice: { languageCode: 'da-DK', ssmlGender: 'MALE' }, // Select the language and SSML voice gender (optional)
			audioConfig: { audioEncoding: 'MP3' }, // type of audio encoding
		}

		try {
			// Performs the text-to-speech request
			const [response] = await client.synthesizeSpeech(request)
			speechResponse = response
		} catch (err) {
			console.log('Error in [createAndPlayAudio]: ', err)
		}

		// Write the binary audio content to a local file
		const writeFile = util.promisify(fs.writeFile)
		try {
			await writeFile(`./users/welcome/${username}.mp3`, speechResponse.audioContent, 'binary')
		} catch (err) {
			console.log('fejl på linje 85 [createAndPlayAudio]:', err)
		}
		console.log(`Audio content written to file: ${username}.mp3`)
		setTimeout(() => playAudio(channelID, username), 1200)
	}
}

bot.on('voiceStateUpdate', (oldMember, newMember) => {
	const newUserChannel = newMember.channelID
	const oldUserChannel = oldMember.channelID
	const newUserJoined = !oldUserChannel && newUserChannel

	// new user joins voice channel
	if (newUserJoined) {
		const username = bot.users.cache.get(newMember.id).username.toLowerCase() // Getting the user by ID.
		console.log(username)
		if ('karsepik-bot' !== username && 'rythm' !== username) {
			fs.readdir(`./users/welcome/`, (err, files) => {
				if (err) {
					console.log(err)
				} else if (files) {
					console.log('files [voiceStateUpdate]:', files, `username: ${username}`)
					console.log(files.indexOf(`${username}.mp3`))
					createAndPlayAudio(username, newUserChannel)
					// ;-1 !== files.indexOf(`${username}.mp3`)
					// 	? setTimeout(() => playAudio(newUserChannel, username), 1200)
					// 	: null // createAndPlayAudio(username, newUserChannel)
				}
			})
		}

	}
	// user leaves voice channel
	// else if (!newUserChannel) {
	// 	const user = bot.users.cache.get(newMember.id) // Getting the user by ID.
	// 	if (user) {
	// 		// createAndPlayAudio(user.username, 'bye')
	// 	} else {
	// 		console.log('fejl på 119')
	// 	}
	// }
})