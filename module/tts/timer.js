
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message } = require('discord.js');
const MDB = require('../../MDB/data');

module.exports = {
    set,
    play,
};

function set(message = new Message, sdb = MDB.object.server, start = Boolean) {
    db.set(`db.${message.guild.id}.tts.timeron`, start);
    db.set(`db.${message.guild.id}.tts.timertime`, Number(process.env.ttsout)*60);
}
function play(message = new Message, sdb = MDB.object.server) {
    setInterval(async () => {
        if (sdb.musicquiz.start.start) return;
        var time = await db.get(`db.${message.guild.id}.tts.timertime`);
        if (time == undefined || time == null) time = Number(process.env.ttsout)*60;
        var on = await db.get(`db.${message.guild.id}.tts.timeron`) || false;
        if (on) {
            if (time <= 0) {
                set(message, sdb, false);
                try {
                    message.guild.me.voice.channel.leave();
                } catch(err) {}
            } else {
                await db.set(`db.${message.guild.id}.tts.timertime`, time-5);
            }
        } else {
            set(message, sdb, false);
        }
    }, 5000);
}
