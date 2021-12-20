// Imports the Google Cloud client library
const textToSpeech = require('@google-cloud/text-to-speech')
const Discord = require('discord.js')
const fs = require('fs')
const { createHash } = require('crypto');
const util = require('util')
const bot = new Discord.Client()

require('dotenv').config()

const apiKeys = {
	discord: process.env.DISCORD_BOT_API
}
const timeoutBeforePlaying = 1200

function getUserMessage(context, username) {
	const userMessages = {
		default: 'hva så motherfucker',
		welcome: {
			wiuf: 'Er I klar til at tabe? Planetens største woke klunke er joinet.',
			jacob: 'jacobo vil spille pik',
			lbenediktson: 'lukas den største champion. what you have to say to joe biden? bing bong motherfucker',
			piaerbillig: 'albino bertram er oppe i din bitch. bing. bong. motherfucker. ',
			socialakavet: 'jimmy joint in the house',
			kasperuttrup: 'Chris Peacock op i den bitch. Corona-alarm, Corona-alarm, Corona-alarm. Manden har i øvrigt 11 centimeter lange hængenosser.',
			default: `hva så ${username}, du stadig en fucking bums!`
		}
	}
	
	return userMessages[context][username] ||
		   userMessages[context].default ||
		   userMessages.default
}

function createHashFromString(string) {
	const hash = createHash('sha256')
	hash.update(string)
	return hash.digest('hex')
}

bot.login(apiKeys.discord)

bot.on('ready', () => console.log('logged ind'))

const playAudio = async (channelID, filename) => {
	const channel = bot.channels.cache.get(channelID)
	const userAudioPath = `./users/welcome/${filename}.mp3`

	channel
		.join()
		.then((connection) => {
			const dispatcher = connection.play(userAudioPath) // PROD
			// dispatcher.on('start', () => console.log('audio is now playing from: ' + userAudioPath))
			dispatcher.on('finish', () => connection.disconnect())
			dispatcher.on('error', (err) => console.log('fejl i [playAudio]:', err))
		})
		.catch((err) => {
			console.log('Error in [playAudio]:', err)
			connection.disconnect()
		})
}

const createAndPlayAudio = (username, channelID, hash = undefined) => {
	if (!hash) hash = username
	console.log('Creates audio for ' + hash)
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
			await writeFile(`./users/welcome/${hash}.mp3`, speechResponse.audioContent, 'binary')
		} catch (err) {
			console.log('fejl på linje 85 [createAndPlayAudio]:', err)
		}
		console.log(`Audio content written to file: ${hash}.mp3`)
		setTimeout(() => playAudio(channelID, hash), timeoutBeforePlaying)
	}
}

bot.on('voiceStateUpdate', (oldMember, newMember) => {
	const newUserChannel = newMember.channelID
	const oldUserChannel = oldMember.channelID
	const userJoined = !oldUserChannel && newUserChannel
	const userLeft = oldUserChannel && !newUserChannel

	const username = bot.users.cache.get(newMember.id).username.toLowerCase() // Getting the user by ID.
	
	// new user joins voice channel
	if ('karsepik-bot' !== username && 'rythm' !== username) {
		if (userJoined) {
			fs.readdir(`./users/welcome/`, (err, files) => {
				if (err) {
					console.log(err)
				} else if (files) {
					const userMessage = getUserMessage('welcome', username)
					const filenameHash = createHashFromString(userMessage)

					;-1 !== files.indexOf(`${filenameHash}.mp3`)
						? setTimeout(() => playAudio(newUserChannel, filenameHash), timeoutBeforePlaying)
						: createAndPlayAudio(username, newUserChannel, filenameHash)
				}
			})
		}
	}
})