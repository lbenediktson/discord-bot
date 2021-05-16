// Imports the Google Cloud client library
const textToSpeech = require('@google-cloud/text-to-speech')
const Discord = require('discord.js')
const fs = require('fs')
const util = require('util')
const bot = new Discord.Client()

bot.login('Nzk4Njk2NDQ2NzQ0MzMwMjYx.X_4yBw.4oEuiHirlyHwO5TMpKKF2uJpRtA')

bot.on('ready', () => {
	console.log('logged ind')
})

let channelConnection

const playAudio = async (channelID, username) => {
	const channel = bot.channels.cache.get(channelID)
	setTimeout(() => {
		channel
			.join()
			.then((connection) => {
				channelConnection = connection
				const dispatcher = connection.play(
					`./users/welcome/${username}.mp3`
				)
				dispatcher.on('start', () => {
					console.log('audio.mp3 is now playing!')
				})
				dispatcher.on('finish', () => {
					console.log('audio.mp3 has finished playing!')
					connection.disconnect()
				})
				// Always remember to handle errors appropriately!
				dispatcher.on('error', (err) => {
					console.log(err)
				})
			})
			.catch((err) => {
				console.log(err)
				connection.disconnect()
			})
	}, 1200)
}

const createAndPlayAudio = (username, channelID) => {
	// Creates a client
	const client = new textToSpeech.TextToSpeechClient()
	async function quickStart() {
		// The text to synthesize
		let text

		console.log(username)

		if (username === 'wiuf') {
			text = 'Er I klar til at tabe? Planetens største woke klunke er joinet.'
		} else if (username === 'jacob') {
			text = `jacobo vil spille`
		} else if (username === 'lbenediktson') {
			text = `Niclas Sefidi er online.`
		} else if (username === 'piaerbillig') {
			text = `albino bertram`
		} else if (username === 'socialakavet') {
			text = `jimmy joint in the house`
		} else {
			text = `hva så ${username}!`
		}

		// Construct the request
		const request = {
			input: { text: text },
			// Select the language and SSML voice gender (optional)
			voice: { languageCode: 'da-DK', ssmlGender: 'MALE' },
			// select the type of audio encoding
			audioConfig: { audioEncoding: 'MP3' },
		}

		// Performs the text-to-speech request
		const [response] = await client.synthesizeSpeech(request)
		// Write the binary audio content to a local file
		const writeFile = util.promisify(fs.writeFile)
		await writeFile(
			`./users/welcome/${username}.mp3`,
			response.audioContent,
			'binary'
		)
		console.log('Audio content written to file: output.mp3')
		playAudio(channelID, username)
	}
	quickStart()
}

bot.on('voiceStateUpdate', (oldMember, newMember) => {
	const newUserChannel = newMember.channelID
	const oldUserChannel = oldMember.channelID

	// new user joins voice channel
	if (!oldUserChannel && newUserChannel) {
		const username = bot.users.cache
			.get(newMember.id)
			.username.toLowerCase() // Getting the user by ID.
		console.log(username)
		if ('karsepik-bot' !== username && 'rythm' !== username ) {
			fs.readdir(`./users/welcome/`, (err, files) => {
				if (err) {
					console.log(err)
				} else if (files) {
					;-1 !== files.indexOf(`${username}.mp3`)
						? playAudio(newUserChannel, username)
						: createAndPlayAudio(username, newUserChannel)
				}
			})
		}

		// user leaves voice channel
	} else if (!newUserChannel) {
		const user = bot.users.cache.get(newMember.id) // Getting the user by ID.
		if (user) {
			// createAndPlayAudio(user.username, 'bye')
		} else {
		}
	}
})

// Import other required libraries
// const fs = require('fs')
// const util = require('util')
// // Creates a client
// const client = new textToSpeech.TextToSpeechClient()
// async function quickStart() {
// 	// The text to synthesize
// 	const text = 'Hej ristian!'

// 	// Construct the request
// 	const request = {
// 		input: { text: text },
// 		// Select the language and SSML voice gender (optional)
// 		voice: { languageCode: 'da-DK', ssmlGender: 'MALE' },
// 		// select the type of audio encoding
// 		audioConfig: { audioEncoding: 'MP3' },
// 	}

// 	// Performs the text-to-speech request
// 	const [response] = await client.synthesizeSpeech(request)
// 	// Write the binary audio content to a local file
// 	const writeFile = util.promisify(fs.writeFile)
// 	await writeFile('output.mp3', response.audioContent, 'binary')
// 	console.log('Audio content written to file: output.mp3')
// }
// quickStart()

// bot token: Nzk4Njk2NDQ2NzQ0MzMwMjYx.X_4yBw.4oEuiHirlyHwO5TMpKKF2uJpRtA
