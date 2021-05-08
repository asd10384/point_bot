
require('dotenv').config();
const { Client, User, ReactionCollector } = require('discord.js');
const db = require('quick.db');
const MDB = require('../MDB/data');
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
    const serverid = reaction.message.guild.id;

    await sdata.findOne({
        serverid: serverid
    }, async (err, db1) => {
        var sdb = MDB.object.server;
        sdb = db1;
        if (err) console.log(err);
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
                        reaction.users.remove(user);
                        return await hint(client, message, [], sdb, user);
                    }
                }
                if (name === '⏭️') {
                    if (sdb.quiz.start.user) {
                        reaction.users.remove(user);
                        return await skip(client, message, ['스킵'], sdb, user);
                    }
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
                    if (sdb.quiz.page.now-1 == 5) sdb.quiz.page.p5 = num;
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
                await sdb.save().catch((err) => console.log(err));
                try {
                    var vchannel = client.channels.cache.get(sdb.quiz.vcid);
                } catch(err) {}
                if (!vchannel) {
                    var vchannel = message.member.voice.channel;
                }
                return await quiz.start_em(client, message, [], sdb, vchannel, user, {first: false});
            }
        }
    });
}
