
require('dotenv').config();
const { Client, User, ReactionCollector, MessageEmbed, Message } = require('discord.js');
const db = require('quick.db');
const MDB = require('../MDB/data');
const log = require('../log/log');
const sdata = MDB.module.server();

const quiz = require('../module/quiz/quiz');
const { hint, skip } = require('../module/quiz/user');

module.exports = {
    reac,
};

async function reac (client = new Client, reaction = new ReactionCollector, user = new User) {
    if (user.bot) return;
    if (!reaction.message.guild) return;
    return await go(client, reaction, user);
}

async function go(client = new Client, reaction = new ReactionCollector, user = new User) {
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    const name = reaction.emoji.name;
    const message = reaction.message;
    const member = message.guild.members.cache.get(user.id);
    const serverid = reaction.message.guild.id;

    await sdata.findOne({
        serverid: serverid
    }, async (err, db1) => {
        var sdb = MDB.object.server;
        sdb = db1;
        if (err) log.errlog(err);
        if (!sdb) {
            await MDB.set.server(message);
            return await reac(client, reaction, user);
        } else {
            if (name === '⏭️') {
                if (sdb.selfcheck.channelid == message.channel.id) {
                    reaction.users.remove(user);
                    return await client.commands.get(`selfcheck`).run(client, message, [], sdb, user);
                }
            }
            if (reaction.message.channel.id === sdb.quiz.qzchannelid) {
                if (name === '💡') {
                    if (sdb.quiz.start.user) {
                        reaction.users.remove(user).catch((err) => {return;});
                        if (member.voice.channel.id !== sdb.quiz.vcid) return errmsg(message, user, `힌트`);
                        return await hint(client, message, [], sdb, user);
                    }
                }
                if (name === '⏭️') {
                    if (sdb.quiz.start.user) {
                        reaction.users.remove(user).catch((err) => {return;});
                        if (member.voice.channel.id !== sdb.quiz.vcid) return errmsg(message, user, `스킵`);
                        return await skip(client, message, ['스킵'], sdb, user);
                    }
                }
                if (sdb.quiz.start.userid !== user.id) {
                    return await errstart(message, user, `버튼 입력`);
                }
                if (name === '1️⃣' || name === '2️⃣' || name === '3️⃣' || name === '4️⃣' || name === '5️⃣') {
                    reaction.users.remove(user);
                    var num = (name === '1️⃣') ? 1 : (name === '2️⃣') ? 2 : (name === '3️⃣') ? 3 : (name === '4️⃣') ? 4 : 5;
                    sdb.quiz.page.click = num;
                    sdb.quiz.page.now = sdb.quiz.page.now+1;
                    if (sdb.quiz.page.now-1 <= 1) sdb.quiz.page.p1 = num;
                    if (sdb.quiz.page.now-1 == 2) sdb.quiz.page.p2 = num;
                    if (sdb.quiz.page.now-1 == 3) sdb.quiz.page.p3 = num;
                    if (sdb.quiz.page.now-1 == 4) sdb.quiz.page.p4 = num;
                }
                if (name === '↩️') {
                    sdb.quiz.page.slide = 0;
                    reaction.users.remove(user);
                    if (sdb.quiz.page.now <= 1) return;
                    sdb.quiz.page.now = sdb.quiz.page.now-1;
                }
                if (name === '⬅️') {
                    reaction.users.remove(user);
                    if (sdb.quiz.page.slide <= 0) return;
                    sdb.quiz.page.slide = sdb.quiz.page.slide-1;
                }
                if (name === '➡️') {
                    reaction.users.remove(user);
                    sdb.quiz.page.slide = sdb.quiz.page.slide+1;
                }
                await sdb.save().catch((err) => log.errlog(err));
                try {
                    var vchannel = client.channels.cache.get(sdb.quiz.vcid);
                } catch(err) {}
                if (!vchannel) {
                    var vchannel = member.voice.channel;
                }
                return await quiz.start_em(client, message, [], sdb, vchannel, user, {first: false});
            }
        }
    });
}

async function errmsg(message = new Message, user = new User, why = String) {
    const em = new MessageEmbed()
        .setTitle(`**${user.username} 님 ${why} 오류**`)
        .setDescription(`**같은 음성채널에서**\n**사용해주세요.**`)
        .setColor('RED');
    return message.channel.send(em);
}
async function errstart(message = new Message, user = new User, why = String) {
    const em = new MessageEmbed()
        .setTitle(`**${user.username} 님 ${why} 오류**`)
        .setDescription(`**퀴즈 시작을 입력한 사람만\n버튼을 누를수 있습니다.**`)
        .setColor('RED');
    return message.channel.send(em).then(m => msgdelete(m, Number(process.env.deletetime)));
}

function msgdelete(m = new Message, t = Number) {
    setTimeout(() => {
        try {
            m.delete();
        } catch(err) {}
    }, t);
}
