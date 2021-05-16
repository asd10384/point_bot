
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, User } = require('discord.js');
const { format } = require('../mds');
const log = require('../../log/log');

const MDB = require('../../MDB/data');
const udata = MDB.module.user();

module.exports = {
    ban,
    unban,
};

const ttscheck = new MessageEmbed()
    .setColor('RED');

// 밴
async function ban(client = new Client, message = new Message, args = Array, sdb = MDB.object.server, user = new User, pp = String) {    
    udata.findOne({
        userID: user.id
    }, async (err, db1) => {
        var udb = MDB.object.user;
        udb = db1;
        if (err) log.errlog(err);
        if (!udb) {
            await MDB.set.user(user);
            return await ban(client, message, args, sdb, user, pp);
        }
        udb.name = user.username;
        if (args[1]) {
            var muser = message.guild.members.cache.get(args[1].replace(/[^0-9]/g, ''));
            if (muser) {
                var user2 = muser.user;
                udata.findOne({
                    userID: user2.id
                }, async (err, udb2) => {
                    if (err) log.errlog(err);
                    if (!udb2) {
                        await MDB.set.user(user2);
                        return await ban(client, message, args, sdb, user, pp);
                    } else {
                        var ttsboolen = udb2.tts;
                        udb2.tts = false;
                        udb2.name = user.username;
                        udb2.save();
                    }
                    if (ttsboolen == false) {
                        ttscheck.setTitle(`\` ${user2.username} \`님의 TTS 설정`)
                            .setDescription(`이미 밴 상태입니다.`);
                        return message.channel.send(ttscheck).then(m => msgdelete(m, Number(process.env.deletetime)+3000));
                    }
                    const date = format.nowdate(new Date());
                    ttscheck.setTitle(`\` ${user2.username} \`님의 TTS 설정`)
                        .setDescription(`${date['time']['2']}\n이후로 \` 밴 \` 되셨습니다.`);
                    return message.channel.send(ttscheck).then(m => {
                        if (!sdb.tts.ttschannelid === message.channel.id) {
                            msgdelete(m, Number(process.env.deletetime)+3000);
                        }
                    });
                });
                return ;
            }
            ttscheck.setTitle(`\` TTS오류 \``)
                .setDescription(`플레이어를 찾을수 없습니다.`);
            return message.channel.send(ttscheck).then(m => msgdelete(m, Number(process.env.deletetime)+3000));
        }
        ttscheck.setTitle(`\` TTS오류 \``)
            .setDescription(`${pp}tts ban [player]`);
        return message.channel.send(ttscheck).then(m => msgdelete(m, Number(process.env.deletetime)+3000));
    });
}
// 밴 끝

// 언밴
async function unban(client = new Client, message = new Message, args = Array, sdb = MDB.object.server, user = new User, pp = String) {    
    udata.findOne({
        userID: user.id
    }, async (err, db1) => {
        var udb = MDB.object.user;
        udb = db1;
        if (err) log.errlog(err);
        if (!udb) {
            await MDB.set.user(user);
            return await unban(client, message, args, sdb, pp);
        }
        udb.name = user.username;
        if (args[1]) {
            var muser = message.guild.members.cache.get(args[1].replace(/[^0-9]/g, '')).user || undefined;
            if (muser) {
                udata.findOne({
                    userID: muser.id
                }, async (err, udb2) => {
                    if (err) log.errlog(err);
                    if (!udb2) {
                        await MDB.set.user(muser);
                        return await unban(client, message, args, sdb, user, pp);
                    } else {
                        udb2.name = user.username;
                        var ttsboolen = udb2.tts;
                        udb2.tts = true;
                        udb2.save();
                    }
                    if (ttsboolen == true) {
                        ttscheck.setTitle(`\` ${muser.username} \`님의 TTS 설정`)
                            .setDescription(`이미 해재된 상태입니다.`);
                        return message.channel.send(ttscheck).then(m => msgdelete(m, Number(process.env.deletetime)+3000));
                    }
                    const date = format.nowdate(new Date());
                    ttscheck.setTitle(`\` ${muser.username} \`님의 TTS 설정`)
                        .setDescription(`${date['time']['2']}\n이후로 \` 해제 \` 되셨습니다.`);
                    return message.channel.send(ttscheck).then(m => {
                        if (!sdb.tts.ttschannelid === message.channel.id) {
                            msgdelete(m, Number(process.env.deletetime)+3000);
                        }
                    });
                });
                return ;
            }
            ttscheck.setTitle(`\` TTS오류 \``)
                .setDescription(`플레이어를 찾을수 없습니다.`);
            return message.channel.send(ttscheck).then(m => msgdelete(m, Number(process.env.deletetime)+3000));
        }
        ttscheck.setTitle(`\` TTS오류 \``)
            .setDescription(`${pp}tts ban [player]`);
        return message.channel.send(ttscheck).then(m => msgdelete(m, Number(process.env.deletetime)+3000));
    });
}
// 언밴 끝

function msgdelete(m = new Message, t = Number) {
    setTimeout(function() {
        try {
            m.delete();
        } catch(err) {}
    }, t);
}
