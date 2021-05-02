
require('dotenv').config();
const { Client, User, ReactionCollector } = require('discord.js');
const db = require('quick.db');
const MDB = require('../MDB/data');
const sdata = MDB.module.server();

const mq = require('../module/musicquiz/musicquiz');
const { hint, skip } = require('../module/musicquiz/user');

const dfprefix = process.env.prefix;

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
    }, async (err, db) => {
        var sdb = MDB.object.server;
        sdb = db;
        if (err) console.log(err);
        if (!sdb) {
            await MDB.set.server(message);
            return await reac(client, reaction, user);
        } else {
            if (reaction.message.channel.id === sdb.musicquiz.mqchannelid) {
                if (name === '💡') {
                    if (sdb.musicquiz.start.user) {
                        reaction.users.remove(user);
                        return await hint(client, message, [], sdb, user);
                    }
                }
                if (name === '⏭️') {
                    if (sdb.musicquiz.start.user) {
                        reaction.users.remove(user);
                        return await skip(client, message, ['스킵'], sdb, user);
                    }
                    
                }
                if (name === '1️⃣' || name === '2️⃣' || name === '3️⃣' || name === '4️⃣' || name === '5️⃣') {
                    reaction.users.remove(user);
                    var num = (name === '1️⃣') ? 1 : (name === '2️⃣') ? 2 : (name === '3️⃣') ? 3 : (name === '4️⃣') ? 4 : 5;
                    sdb.musicquiz.page.click = num;
                    sdb.musicquiz.page.now = sdb.musicquiz.page.now+1;
                    if (sdb.musicquiz.page.now-1 <= 1) sdb.musicquiz.page.p1 = num;
                    if (sdb.musicquiz.page.now-1 == 2) sdb.musicquiz.page.p2 = num;
                    if (sdb.musicquiz.page.now-1 == 3) sdb.musicquiz.page.p3 = num;
                    if (sdb.musicquiz.page.now-1 == 4) sdb.musicquiz.page.p4 = num;
                    if (sdb.musicquiz.page.now-1 == 5) sdb.musicquiz.page.p5 = num;
                }
                if (name === '↩️') {
                    reaction.users.remove(user);
                    if (sdb.musicquiz.page.now <= 1) return;
                    sdb.musicquiz.page.now = sdb.musicquiz.page.now-1;
                }
                if (name === '⬅️' || name === '➡️') {
                    reaction.users.remove(user);
                    if (sdb.musicquiz.page.slide <= 0) return;
                    sdb.musicquiz.page.slide = sdb.musicquiz.page.slide - (name == '➡️') ? 1 : -1;
                }
                await sdb.save().catch((err) => console.log(err));
                try {
                    var vchannel = client.channels.cache.get(sdb.musicquiz.vcid);
                } catch(err) {}
                if (!vchannel) {
                    var vchannel = message.member.voice.channel;
                }
                return await mq.start_em(client, message, [], sdb, vchannel, {first: false});
            }
        }
    });
}
