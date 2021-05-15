
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, Channel, User } = require('discord.js');
const MDB = require('../../MDB/data');

const quiz = require('./quiz');
const { hint, skip } = require('./user');

module.exports = {
    ansermsg,
};

async function ansermsg(client = new Client, message = new Message, args = Array, sdb = MDB.object.server, user = new User) {
    const member = message.guild.members.cache.get(user.id);
    if (sdb.quiz.vcid !== member.voice.channel.id) {
        errmsg(message, user, `채팅 입력`);
        return setTimeout(() => {
            message.delete();
        }, 100);
    }
    const text = args.join(' ').trim().toLowerCase();

    var count = sdb.quiz.quiz.count;
    var name = sdb.quiz.quiz.name[count];
    var anser_text = `${name}`.trim().toLowerCase();

    if (text == '힌트' || text == 'hint') {
        return await hint(client, message, args, sdb, user);
    }
    if (text == '스킵' || text == 'skip') {
        return await skip(client, message, args, sdb, user);
    }
    if (text == anser_text) {
        sdb.quiz.start.user = false;
        await sdb.save();
        return await quiz.anser(client, message, args, sdb, user);
    }
}

async function errmsg(message = new Message, user = new User, why = String) {
    const em = new MessageEmbed()
        .setTitle(`**${user.username} 님 ${why} 오류**`)
        .setDescription(`**같은 음성채널에서**\n**사용해주세요.**`)
        .setColor('RED');
    return message.channel.send(em);
}