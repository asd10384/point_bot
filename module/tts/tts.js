
require('dotenv').config();
const db = require('quick.db');
const { writeFile } = require('fs');
const { MessageEmbed, Client, Message, Channel } = require('discord.js');
const MDB = require('../../MDB/data');
const udata = MDB.module.user();

const TTS = require('@google-cloud/text-to-speech');
const ttsclient = new TTS.TextToSpeechClient({
    keyFile: 'googlettsapi.json',
});

const ytdl = require('ytdl-core');
var checkyturl = /(?:http:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/;
var checkytid = /(?:http:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?/gi;

const vcerr = new MessageEmbed()
    .setTitle(`먼저 봇을 음성에 넣고 사용해 주십시오.`)
    .setDescription(`${process.env.prefix}join [voice channel id]`)
    .setColor('RANDOM');

module.exports = {
    tts,
    play,
    broadcast,
};

// 기본
async function tts(client = new Client, message = new Message, args = Array, sdb = Object) {
    const yterr = new MessageEmbed()
        .setTitle(`\` 주소 오류 \``)
        .setDescription(`영상을 찾을수 없습니다.`)
        .setColor('RED');
    
    udata.findOne({
        userID: message.member.user.id
    }, async (err, udb) => {
        if (err) console.log(err);
        if (!udb) {
            await MDB.set.user(message.member.user);
        }
        var ttsboolen = await (udb.tts) ? true : false;
        if (!ttsboolen) return msgdelete(message, 20);

        var text = args.join(' ');
        var url = await geturl(message, text, {});

        if (url.url == 'youtubelinkerror') {
            return message.channel.send(yterr).then(m => msgdelete(m, Number(process.env.deletetime)));
        }
        if (sdb.tts) {
            var channel;
            try {
                if (message.member.voice.channel) {
                    channel = message.member.voice.channel;
                } else if (message.guild.me.voice.channel) {
                    channel = message.guild.voice.channel;
                }
                if (url.text) {
                    return await play(message, channel, url.url, url.options);
                }
                return await broadcast(message, channel, url.url, url.options);
            } catch (err) {
                console.log(err);
                return message.channel.send(vcerr).then(m => msgdelete(m, Number(process.env.deletetime)));
            }
        } else {
            const music = new MessageEmbed()
                .setTitle(`\` 재생 오류 \``)
                .setDescription(`현재 노래퀴즈가 진행중입니다.\n노래퀴즈가 끝나고 사용해주세요.`)
                .setColor('RED');
            return message.channel.send(music).then(m => msgdelete(m, Number(process.env.deletetime)));
        }
    });
}
// 기본 끝

// 유튜브 URL 생성
async function geturl(message = new Message, text = String, options = Object) {
    if (text.match(checkyturl)) {
        try {
            options = {
                volume: 0.08
            };
            message.delete();
            return {
                url: ytdl(`https://youtu.be/${text.replace(checkytid, '')}`, { bitrate: 512000 }),
                options: options,
                text: false,
            };
        } catch(e) {
            return {
                url: 'youtubelinkerror',
                options: options,
                text: false,
            };
        }
    }
    return {
        url: msg(text),
        options: options,
        text: true,
    };
}
// 유튜브 URL 생성 끝

// TEXT -> tts.WAV로 변경
async function play(message = new Message, channel = new Channel, text = String, options = Object) {
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

    var fileurl = `tts.wav`;
    writeFile(fileurl, response[0].audioContent, async (err) => {
        await broadcast(message, channel, fileurl, options);
    });
}
// TEXT -> tts.WAV로 변경 끝

// 출력
async function broadcast(message = new Message, channel = new Channel, url = String, options = Object) {
    channel.join().then(connection => {
        const dispatcher = connection.play(url, options);
        // dispatcher.on("finish", async () => {
        //     return;
        // });
    });
}
// 출력 끝

function msg (text) {
    text = text.replace(/\?/gi, '물음표') || text;
    text = text.replace(/\!/gi, '느낌표') || text;
    text = text.replace(/\~/gi, '물결표') || text;
    text = text.replace(/\+/gi, '더하기') || text;
    text = text.replace(/\-/gi, '빼기') || text;

    text = text.replace(/\'/gi, '따옴표') || text;
    text = text.replace(/\"/gi, '큰따옴표') || text;

    text = text.replace(/\(/gi, '여는소괄호') || text;
    text = text.replace(/\)/gi, '닫는소괄호') || text;
    text = text.replace(/\{/gi, '여는중괄호') || text;
    text = text.replace(/\}/gi, '닫는중괄호') || text;
    text = text.replace(/\[/gi, '여는대괄호') || text;
    text = text.replace(/\]/gi, '닫는대괄호') || text;

    text = text.replace(/ㄹㅇ/gi, '리얼') || text;
    text = text.replace(/ㅅㅂ/gi, '시바') || text;
    text = text.replace(/ㄲㅂ/gi, '까비') || text;
    text = text.replace(/ㅅㄱ/gi, '수고') || text;
    text = text.replace(/ㅎㅇ/gi, '하이') || text;
    text = text.replace(/ㄴㅇㅅ/gi, '나이스') || text;

    return text;
}
function msgdelete(m = new Message, t = Number) {
    setTimeout(function() {
        try {
            m.delete();
        } catch(err) {}
    }, t);
}
