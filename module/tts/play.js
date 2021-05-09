
require('dotenv').config();
const MDB = require('../../MDB/data');
const { writeFile, createWriteStream } = require('fs');
const timer = require('./timer');
var checktimer = false;

const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const ttsclient = new TextToSpeechClient({
    keyFile: 'googlettsapi.json',
    fallback: false,
});

module.exports = {
    play,
    broadcast,
};

// TEXT -> tts.WAV로 변경
async function play(message = new Message, sdb = MDB.object.server, channel = new Channel, text = String, options = Object) {
    const response = await ttsclient.synthesizeSpeech({
        input: {text: text},
        voice: {
            languageCode: 'ko-KR',
            name: 'ko-KR-Standard-A'
        },
        audioConfig: {
            audioEncoding: 'MP3', // 형식
            speakingRate: 0.905, // 속도
            pitch: 0, // 피치
            // sampleRateHertz: 16000, // 헤르츠
            // effectsProfileId: ['medium-bluetooth-speaker-class-device'] // 효과 https://cloud.google.com/text-to-speech/docs/audio-profiles
        },
    });
    options['volume'] = 0.7;

    var fileurl = `ttssound/${message.guild.id}.wav`;
    var ws = createWriteStream(fileurl);
    ws.write(response[0].audioContent);
    ws.end();
    ws.on('finish', async function() {
        return await broadcast(message, sdb, channel, fileurl, options);
    });
    // writeFile(fileurl, response[0].audioContent, async (err) => {
    //     await broadcast(message, sdb, channel, fileurl, options);
    // });
    return;
}
// TEXT -> tts.WAV로 변경 끝

// 출력
async function broadcast(message = new Message, sdb = Object, channel = new Channel, url = String, options = Object) {
    channel.join().then(connection => {
        timer.set(message, sdb, true);
        const dispatcher = connection.play(url, options);
        dispatcher.on("finish", async () => {
            if (!checktimer) {
                checktimer = true;
                timer.play(message, sdb);
            }
        });
    });
}
// 출력 끝
