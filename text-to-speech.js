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
	channel
		.join()
		.then((connection) => {
			channelConnection = connection
			const dispatcher = connection.play(`./users/welcome/${username}.mp3`)
			dispatcher.on('start', () => {
				console.log('audio.mp3 is now playing!')
			})
			dispatcher.on('finish', () => {
				console.log('audio.mp3 has finished playing!')
				connection.disconnect()
			})
			// Always remember to handle errors appropriately!
			dispatcher.on('error', (err) => {
				console.log('fejl på linje 32 [playAudio]:', err)
			})
		})
		.catch((err) => {
			console.log('fejl på linje 36 [playAudio]:', err)
			connection.disconnect()
		})
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
			text = `hva så ${username}, du stadig en fucking bums!!`
		}

		// Construct the request
		const request = {
			input: { text: text },
			// Select the language and SSML voice gender (optional)
			voice: { languageCode: 'da-DK', ssmlGender: 'MALE' },
			// select the type of audio encoding
			audioConfig: { audioEncoding: 'MP3' },
		}

		try {
			// Performs the text-to-speech request
			const [response] = await client.synthesizeSpeech(request)
		} catch (err) {
			console.log('fejl på linje 77: [createAndPlayAudio]', err)
		}

		// Write the binary audio content to a local file
		const writeFile = util.promisify(fs.writeFile)
		try {
			await writeFile(`./users/welcome/${username}.mp3`, response.audioContent, 'binary')
		} catch (err) {
			console.log('fejl på linje 85 [createAndPlayAudio]:', err)
		}
		console.log('Audio content written to file: output.mp3')
		setTimeout(playAudio(channelID, username), 1200)
	}
	quickStart()
}

bot.on('voiceStateUpdate', (oldMember, newMember) => {
	const newUserChannel = newMember.channelID
	const oldUserChannel = oldMember.channelID

	// new user joins voice channel
	if (!oldUserChannel && newUserChannel) {
		const username = bot.users.cache.get(newMember.id).username.toLowerCase() // Getting the user by ID.
		console.log(username)
		if ('karsepik-bot' !== username && 'rythm' !== username) {
			fs.readdir(`./users/welcome/`, (err, files) => {
				if (err) {
					console.log(err)
				} else if (files) {
					console.log('files [voiceStateUpdate]:', files, `username: ${username}`)
					console.log(files.indexOf(`${username}.mp3`))
					;-1 !== files.indexOf(`${username}.mp3`)
						? setTimeout(playAudio(newUserChannel, username), 1200)
						: null// createAndPlayAudio(username, newUserChannel)
				}
			})
		}

		// user leaves voice channel
	} else if (!newUserChannel) {
		const user = bot.users.cache.get(newMember.id) // Getting the user by ID.
		if (user) {
			// createAndPlayAudio(user.username, 'bye')
		} else {
			console.log('fejl på 119')
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
