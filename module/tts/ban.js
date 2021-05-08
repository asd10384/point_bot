
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message } = require('discord.js');
const { format } = require('../mds');

const MDB = require('../../MDB/data');
const udata = MDB.module.user();

module.exports = {
    ban,
    unban,
};

const ttscheck = new MessageEmbed()
    .setColor('RED');

// 밴
async function ban(client = new Client, message = new Message, args = Array, sdb = MDB.object.server, pp = String) {    
    udata.findOne({
        userID: message.member.user.id
    }, async (err, db1) => {
        var udb = MDB.object.user;
        udb = db1;
        if (err) console.log(err);
        if (!udb) {
            await MDB.set.user(message.member.user);
            return await ban(client, message, args, sdb);
        }
        if (args[1]) {
            var muser = message.guild.members.cache.get(args[1].replace(/[^0-9]/g, ''));
            if (muser) {
                var user = muser.user;
                udata.findOne({
                    userID: user.id
                }, async (err, udb2) => {
                    if (err) console.log(err);
                    if (!udb2) {
                        await MDB.set.user(user);
                        var ttsboolen = true;
                    } else {
                        var ttsboolen = udb2.tts;
                        udb2.tts = false;
                        udb2.save().catch(err => console.log(err));
                    }
                    if (ttsboolen == false) {
                        ttscheck.setTitle(`\` ${user.username} \`님의 TTS 설정`)
                            .setDescription(`이미 밴 상태입니다.`);
                        return message.channel.send(ttscheck).then(m => msgdelete(m, Number(process.env.deletetime)+3000));
                    }
                    const date = format.nowdate(new Date());
                    ttscheck.setTitle(`\` ${user.username} \`님의 TTS 설정`)
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
async function unban(client = new Client, message = new Message, args = Array, sdb = MDB.object.server, pp = String) {    
    udata.findOne({
        userID: message.member.user.id
    }, async (err, db1) => {
        var udb = MDB.object.user;
        udb = db1;
        if (err) console.log(err);
        if (!udb) {
            await MDB.set.user(message.member.user);
            return await unban(client, message, args, sdb);
        }
        if (args[1]) {
            var muser = message.guild.members.cache.get(args[1].replace(/[^0-9]/g, ''));
            if (muser) {
                var user = muser.user;
                udata.findOne({
                    userID: user.id
                }, async (err, udb2) => {
                    if (err) console.log(err);
                    if (!udb2) {
                        await MDB.set.user(user);
                        var ttsboolen = false;
                    } else {
                        var ttsboolen = udb2.tts;
                        udb2.tts = true;
                        udb2.save().catch(err => console.log(err));
                    }
                    if (ttsboolen == true) {
                        ttscheck.setTitle(`\` ${user.username} \`님의 TTS 설정`)
                            .setDescription(`이미 해재된 상태입니다.`);
                        return message.channel.send(ttscheck).then(m => msgdelete(m, Number(process.env.deletetime)+3000));
                    }
                    const date = format.nowdate(new Date());
                    ttscheck.setTitle(`\` ${user.username} \`님의 TTS 설정`)
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
