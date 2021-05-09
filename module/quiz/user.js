
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, Channel, User } = require('discord.js');
const MDB = require('../../MDB/data');

const quiz = require('./quiz');

const em = new MessageEmbed()
    .setColor('ORANGE');

module.exports = {
    hint,
    skip,
};

async function hint(client = new Client, message = new Message, args = Array, sdb = MDB.object.server, user = new User, anser = String) {
    if (!sdb.quiz.start.user) return;
    if (!sdb.quiz.start.hint) return;

    var usercount;
    try {
        usercount = Math.floor(message.guild.me.voice.channel.members.size / 2);
    } catch(err) {
        await quiz.end(client, message, sdb);
    }
    var hint = sdb.quiz.user.hint;
    const userid = user.id;
    var text = '';
    if (hint.includes(userid)) {
        text = `**${user.username}** 님은 이미 힌트를 요청했습니다.`
    } else {
        hint.push(userid);
        text = `**${user.username}** 님이 힌트를 요청했습니다.`;
    }
    if (hint.length >= usercount || (args[0] == '관리자')) {
        sdb.quiz.start.hint = false;
        sdb.quiz.user.hint = [];
        const tcount = anser.replace(/-/g,'').replace(/ /g,'').length;
        var rndlist = [];
        for (i=0; i<Math.floor(tcount/2); i++) {
            var r = Math.floor(Math.random() * tcount-1);
            if (r < 0 || r >= tcount || rndlist.includes(r) || anser[r] == '-' || anser[r] == ' ') {
                i--;
                continue;
            }
            rndlist.push(r);
        }
        var outt = '';
        for (i=0; i<anser.length; i++) {
            if (rndlist.includes(i)) {
                outt += `◻️`;
            } else {
                outt += `${anser[i].toUpperCase()}`;
            }
        }
        await sdb.save();
        em.setTitle(`**힌트**`)
            .setDescription(`${outt.replace(/ /g,'  ')}`);
        return message.channel.send(em);
    }
    sdb.quiz.user.hint = hint;
    await sdb.save();
    em.setTitle(`**힌트 (${hint.length} / ${usercount})**`)
        .setDescription(`
            ${text}

            ${usercount-hint.length}명이 더 힌트를 입력해야합니다.
        `);
    return message.channel.send(em);
}

async function skip(client = new Client, message = new Message, args = Array, sdb = MDB.object.server, user = new User) {
    if (!sdb.quiz.start.user) return;

    var usercount;
    try {
        usercount = Math.floor(message.guild.me.voice.channel.members.size / 2);
    } catch(err) {
        return await quiz.end(client, message, sdb);
    }
    var skip = sdb.quiz.user.skip;
    const userid = user.id;
    var text = '';
    if (skip.includes(userid)) {
        text = `**${user.username}** 님은 이미 스킵을 요청했습니다.`
    } else {
        skip.push(userid);
        text = `**${user.username}** 님이 스킵을 요청했습니다.`;
    }
    if (skip.length >= usercount) {
        sdb.quiz.user.skip = [];
        await sdb.save();
        return await quiz.anser(client, message, ['스킵'], sdb, user);
    }
    sdb.quiz.user.skip = skip;
    await sdb.save();
    em.setTitle(`**스킵 (${skip.length} / ${usercount})**`)
        .setDescription(`
            ${text}

            ${usercount-skip.length}명이 더 스킵을 입력해야합니다.
        `);
    return message.channel.send(em);
}
