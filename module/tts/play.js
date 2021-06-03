
require('dotenv').config();
const db = require('quick.db');
const { Message, Channel } = require('discord.js');
const MDB = require('../../MDB/data');
const { writeFile, readFileSync } = require('fs');
const timer = require('./timer');

const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const ttsclient = new TextToSpeechClient({
    keyFile: 'googlettsapi.json',
    fallback: false,
});

module.exports = {
    play,
    broadcast,
};

const sncheckobj = require('./set/signature');
const snlist = Object.keys(sncheckobj);
const sncheck = eval(`/(${snlist.join('|')})/g`);

// TEXT -> tts.WAV로 변경
async function play(message = new Message, sdb = MDB.object.server, channel = new Channel, text = '', options = Object) {
    var list = [];
    var output;
    text = text.replace(sncheck, rep);
    list = text.split('#@#');
    if (list.length > 0) {
        for (i in list) {
            if (snlist.includes(list[i])) {
                list[i] = readFileSync(`sound/signature/${sncheckobj[list[i]]}.mp3`);
            } else {
                list[i] = await gettext(list[i]);
            }
        }
        output = Buffer.concat(list);
    } else {
        output = await gettext(text);
    }

    options['volume'] = 0.7;
    var fileurl = `${message.guild.id}-${message.author.id}.wav`;
    writeFile(fileurl, output, async function() {
        return broadcast(message, sdb, channel, fileurl, options);
    });
}
// TEXT -> tts.WAV로 변경 끝

// 출력
async function broadcast(message = new Message, sdb = Object, channel = new Channel, url = String, options = Object) {
    channel.join().then(async function(connection) {
        // const dispatcher = 
        connection.play(url, options);
    });
    timer.set(message, sdb, true);
}

async function gettext(text = '') {
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
    return response[0].audioContent;
}
// 출력 끝

function getwav(name = '') {
    var text = readFileSync(`sound/signature/${name}.wav`);
    console.log(text);
    return text;
}

function rep(text = '') {
    return '#@#'+text+'#@#';
}