
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message } = require('discord.js');
const MDB = require('../../MDB/data');

module.exports = {
    set,
    play,
};

async function set(message = new Message, sdb = MDB.object.server, start = Boolean) {
    db.set(`db.${message.guild.id}.tts.timeron`, start);
    db.set(`db.${message.guild.id}.tts.timertime`, Number(process.env.ttsout)*60);
}
async function play(message = new Message, sdb = MDB.object.server) {
    setInterval(async () => {
        var time = db.get(`db.${message.guild.id}.tts.timertime`);
        if (time == undefined || time == null) time = Number(process.env.ttsout)*60;
        var status = db.get(`db.${message.guild.id}.tts.timerstatus`);
        if (status) {
            db.set(`db.${message.guild.id}.tts.timerstatus`, false);
            var userid = db.get(`db.${message.guild.id}.tts.timeruserid`);
            db.set(`db.${message.guild.id}.tts.timeruserid`, '');
            var text = `\n** ${message.guild.name} 서버 **\nTTS타이머가 실행중입니다.\n시간 : ${time}\n음악퀴즈 : ${sdb.quiz.start.start}`;
            console.log(text);
            const user = (message.guild.members.cache.get(userid)) ? message.guild.members.cache.get(userid).user : undefined;
            if (user) {
                user.send(new MessageEmbed().setDescription(text).setColor('ORANGE'))
                    .catch(() => {return;})
                    .then(m => msgdelete(m, Number(process.env.deletetime)*3));
            }
        }
        if (sdb.quiz.start.start) return;
        var on = db.get(`db.${message.guild.id}.tts.timeron`);
        if (on) {
            if (time <= 0) {
                set(message, sdb, false);
                try {
                    message.guild.me.voice.channel.leave();
                } catch(err) {}
            } else {
                db.set(`db.${message.guild.id}.tts.timertime`, time-5);
            }
        } else {
            set(message, sdb, false);
        }
    }, 5000);
}
