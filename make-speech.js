// Imports the Google Cloud client library
const textToSpeech = require('@google-cloud/text-to-speech')
const fs = require('fs')
const util = require('util')

const createAudio = (text) => {
	// Creates a client
	const client = new textToSpeech.TextToSpeechClient()
	async function quickStart() {
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
			`./users/welcome/output.mp3`,
			response.audioContent,
			'binary'
		)
		console.log('Audio content written to file: output.mp3')
	}
	quickStart()
}

createAudio('Chris Peacock op i den bitch. Corona-alarm, Corona-alarm, Corona-alarm. Manden har i øvrigt 11 centimeter lange hængenosser.')