
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message } = require('discord.js');
const MDB = require('../MDB/data');

const check = require('../module/musicquiz/check');
const mq = require('../module/musicquiz/musicquiz');
const { hint } = require('../module/musicquiz/user');

/*
const MDB = require('../../MDB/data');
const udata = MDB.module.user();

udata.findOne({
    userID: message.member.user.id
}, async (err, db) => {
    var udb = MDB.object.user;
    udb = db;
    if (err) console.log(err);
    if (!udb) {
        await MDB.set.user(message.member.user);
        return client.commands.get(`${this.name}`).run(client, message, args, sdb);
    }
    command
});
*/

const per = new MessageEmbed()
    .setTitle(`이 명령어를 사용할 권한이 없습니다.`)
    .setColor('RED');
const vchannelerr = new MessageEmbed()
    .setTitle(`**음악퀴즈 오류**`)
    .setDescription(`음성채널에 들어간 뒤 사용해주세요.`)
    .setColor('RED');
const emerr = new MessageEmbed()
    .setTitle(`**음악퀴즈 오류**`)
    .setColor('RED');

module.exports = {
    name: 'musicquiz',
    aliases: ['음악퀴즈','mq'],
    description: '음악퀴즈 도움말',
    async run (client = new Client, message = new Message, args = Array, sdb = MDB.object.server) {
        var pp = db.get(`dp.prefix.${message.member.id}`);
        if (pp == (null || undefined)) {
            await db.set(`db.prefix.${message.member.id}`, process.env.prefix);
            pp = process.env.prefix;
        }
        // if (!(message.member.permissions.has('ADMINISTRATOR') || message.member.roles.cache.some(r=>sdb.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, Number(process.env.deletetime)));

        if (args[0] == '시작' || args[0] == 'start') {
            // 음성확인
            var vchannel = await check.voice(message, sdb);
            if (!vchannel.success) return message.channel.send(vchannelerr).then(m => msgdelete(m, Number(process.env.deletetime)));
            
            if (!sdb.musicquiz.start.embed) {
                sdb.musicquiz.start.embed = true;
                return await mq.start(client, message, args, sdb, vchannel);
            } else {
                emerr.setDescription(`
                    이미 음악퀴즈 시작을 입력하셨습니다.

                    **${process.env.prefix}음악퀴즈 종료**
                    를 입력하신뒤 다시 시도해주세요.
                `);
                return message.channel.send(emerr).then(m => msgdelete(m, Number(process.env.deletetime)));
            }
        }
        if (args[0] == '종료' || args[0] == 'stop') {
            sdb.musicquiz.start.embed = false;
            await mq.end(client, message, sdb);
            return await sdb.save().catch((err) => console.log(err));
        }
        if (args[0] == '힌트' || args[0] == 'hint') {
            return await hint(client, message, ['관리자'], sdb, message.member.user);
        }
        if (args[0] == '스킵' || args[0] == 'skip') {
            return await mq.anser(client, message, ['스킵','관리자'], sdb);
        }
        if (args[0] == '설정' || args[0] == 'setting') {
            return message.channel.send(`현재 제작중`).then(m => msgdelete(m, Number(process.env.deletetime)));
        }
        if (args[0] == '기본설정') {
            if (!(message.member.permissions.has('ADMINISTRATOR') || message.member.roles.cache.some(r=>sdb.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, Number(process.env.deletetime)));
            client.commands.get('musicquizset').run(client, message, args, sdb);
        }
        if (args[0] == '도움말' || args[0] == '명령어' || args[0] == 'help' || args[0] == 'info') {
            const help = new MessageEmbed()
                .setTitle(`**음악퀴즈 도움말**`)
                .setDescription(`
                    \` 명령어 \`
                    ${pp}음악퀴즈 시작 : 음악퀴즈를 시작합니다.
                    ${pp}음악퀴즈 중지 : 진행중인 음악퀴즈를 멈춥니다.
                    ${pp}음악퀴즈 설정 : 정답형식이나 시간을 설정할수 있습니다.
    
                    \` 관리자 명령어 \`
                    ${pp}음악퀴즈 기본설정 : 음악퀴즈 채널을 생성합니다.
                    ${pp}음악퀴즈 스킵 : 투표없이 스킵합니다.
                    ${pp}음악퀴즈 힌트 :투표없이 힌트를 받습니다.
                `)
                .setColor('ORANGE');
            return message.channel.send(help).then(m => msgdelete(m, Number(process.env.deletetime)*3));
        }
        return ;
    },
};

function msgdelete(m = new Message, t = Number) {
    setTimeout(() => {
        try {
            m.delete();
        } catch(err) {}
    }, t);
}
