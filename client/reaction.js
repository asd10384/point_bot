
require('dotenv').config();
const db = require('quick.db');
const MDB = require('../MDB/data');

const { msg_start, play_hint, play_skip } = require('../module/musicquiz/musicquiz');

const dfprefix = process.env.prefix;

module.exports = {
    reaction,
};

async function reaction (client, reaction, user) {
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();

    if (user.bot) return;
    if (!reaction.message.guild) return;

    const name = reaction.emoji.name;
    const message = reaction.message;
    const serverid = reaction.message.guild.id;

    const udata = await MDB.get.server(message);

    var page = await db.get(`db.music.${serverid}.page`);
    if (page == undefined || page == null) page = 1;
    if (reaction.message.channel.id === udata.channelid) {
        if (name === '💡') {
            reaction.users.remove(user);
            return await play_hint(client, message, user.id);
        }
        if (name === '⏭️') {
            reaction.users.remove(user);
            return await play_skip(client, message, user.id);
        }
        if (name === '⬅️' || name === '➡️') {
            reaction.users.remove(user);
            var lrpage = await db.get(`db.music.${serverid}.lrpage`);
            if (lrpage == undefined || lrpage == null || lrpage == 1) return ;
            if (name === '⬅️') lrpage-1;
            if (name === '➡️') lrpage+1;
            await db.set(`db.music.${serverid}.lrpage`, lrpage);
            try {
                var voiceChannel = client.channels.cache.get(udata.voicechannelid);
            } catch(err) {}
            if (!voiceChannel) {
                var voiceChannel = message.member.voice.channel;
            }
            return await msg_start(client, serverid, message, [], 0, voiceChannel, udata.channelid, udata.npid);
        }
        if (name === '↩️') {
            reaction.users.remove(user);
            if (page == 1) return ;
            await db.set(`db.music.${serverid}.page`, page-1);
            await db.set(`db.music.${serverid}.lrpage`, 1);
            try {
                var voiceChannel = client.channels.cache.get(udata.voicechannelid);
            } catch(err) {}
            if (!voiceChannel) {
                var voiceChannel = message.member.voice.channel;
            }
            return await msg_start(client, serverid, message, [], 0, voiceChannel, udata.channelid, udata.npid);
        }
        if (name === '1️⃣' || name === '2️⃣' || name === '3️⃣' || name === '4️⃣' || name === '5️⃣') {
            reaction.users.remove(user);
            var num = name === '1️⃣' ? 1 : name === '2️⃣' ? 2 : name === '3️⃣' ? 3 : name === '4️⃣' ? 4 : 5;
            await db.set(`db.music.${serverid}.page`, page+1);
            await db.set(`db.music.${serverid}.${page}.lastnum`, num);
            await db.set(`db.music.${serverid}.lrpage`, 1);
            try {
                var voiceChannel = client.channels.cache.get(udata.voicechannelid);
            } catch(err) {}
            if (!voiceChannel) {
                var voiceChannel = message.member.voice.channel;
            }
            return await msg_start(client, serverid, message, [], num, voiceChannel, udata.channelid, udata.npid);
        }
    }
}
