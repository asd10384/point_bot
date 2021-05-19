
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, Channel, User } = require('discord.js');
const { broadcast, play } = require('./play');
const MDB = require('../../MDB/data');
const log = require('../../log/log');
const udata = MDB.module.user();

const ytdl = require('ytdl-core');
var checkyturl = /(?:http:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/;
var checkytid = /(?:http:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?/gi;

const vcerr = new MessageEmbed()
    .setTitle(`먼저 봇을 음성에 넣고 사용해 주십시오.`)
    .setDescription(`${process.env.prefix}join [voice channel id]`)
    .setColor('RANDOM');
const yterr = new MessageEmbed()
    .setTitle(`\` 주소 오류 \``)
    .setDescription(`영상을 찾을수 없습니다.`)
    .setColor('RED');

module.exports = {
    tts,
};

// 기본
async function tts(client = new Client, message = new Message, args = Array, sdb = MDB.object.server, user = new User) {    
    udata.findOne({
        userID: user.id
    }, async (err, db1) => {
        var udb = MDB.object.user;
        udb = db1;
        if (err) log.errlog(err);
        if (!udb) {
            await MDB.set.user(user);
            return await tts(client, message, args, sdb, user);
        }
        udb.name = user.username;
        var ttsboolen = (udb.tts) ? true : false;
        if (!ttsboolen) return msgdelete(message, 20);

        var text = args.join(' ');
        var url = await geturl(message, text, {});

        if (url.url == 'youtubelinkerror') {
            return message.channel.send(yterr).then(m => msgdelete(m, Number(process.env.deletetime)));
        } else {
            message.delete();
        }
        if (sdb.tts.tts) {
            db.set(`db.${message.guild.id}.tts.timertime`, 600);
            var channel;
            try {
                if (message.member.voice.channel) {
                    channel = message.member.voice.channel;
                } else if (message.guild.me.voice.channel) {
                    channel = message.guild.voice.channel;
                }
                if (url.text) {
                    return await play(message, sdb, channel, url.url, url.options);
                }
                return await broadcast(message, sdb, channel, url.url, url.options);
            } catch (err) {
                log.errlog(err);
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
            var yt = ytdl(`https://youtu.be/${text.replace(checkytid, '')}`, { bitrate: 512000 });
            return {
                url: yt,
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

function msg (text = '') {
    var repobj = {
        '?':'물음표',
        '!':'느낌표',
        '~':'물결',
        '+':'더하기',
        '-':'빼기',
        '(':'여는소괄호',
        ')':'닫는소괄호',
        '{':'여는중괄호',
        '}':'닫는중괄호',
        '[':'여는대괄호',
        ']':'닫는대괄호',
        'ㄹㅇ':'리얼',
        'ㅅㅂ':'시바',
        'ㄲㅂ':'까비',
        'ㅎㅇ':'하이',
        'ㅇㅋ':'오키'
    };
    text = text.replace(/<@\!?[(0-9)]{18}>/, '');
    for (i in repobj) {
        if (text.includes(i)) text = text.split(i).join(repobj[i]);
    }
    return text;
}
function msgdelete(m = new Message, t = Number) {
    setTimeout(() => {
        try {
            m.delete();
        } catch(err) {}
    }, t);
}
