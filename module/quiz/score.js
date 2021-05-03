
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, Channel } = require('discord.js');
const MDB = require('../../MDB/data');

module.exports = {
    score,
};

async function score(client = new Client, message = new Message, args = [], sdb = MDB.object.server) {
    var score = sdb.musicquiz.user.score;
    var skip = sdb.musicquiz.music.skipcount;
    var text = '';
    var i = 1;
    for (s in score) {
        text += `**${i}.** <@${s}> : ${score[s]}\n`;
        i++;
    }
    if (text == undefined || text == '') {
        text = `**1.** 없음\n`;
    }
    const em = new MessageEmbed()
        .setTitle(`** [ 퀴즈 스코어 ] **`)
        .setDescription(`
            ${text}

            스킵한 문제 : ${skip}개
        `)
        .setFooter(`스코어는 다음퀴즈 전까지 사라지지 않습니다.`)
        .setColor('ORANGE');
    try {
        var c = client.channels.cache.get(sdb.musicquiz.mqchannelid);
        c.messages.fetch(sdb.musicquiz.msg.scoreid).then(m => {
            m.edit(em);
        });
    } catch(err) {}
}
