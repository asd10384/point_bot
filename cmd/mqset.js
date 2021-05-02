
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message } = require('discord.js');
const MDB = require('../MDB/data');

const msg = require('../module/musicquiz/msg');
const mq = require('../module/musicquiz/musicquiz');

const per = new MessageEmbed()
    .setTitle(`이 명령어를 사용할 권한이 없습니다.`)
    .setColor('RED');

module.exports = {
    name: 'musicquizset',
    aliases: ['음악퀴즈설정','mqset'],
    description: '음악퀴즈채널을 만들고 봇과 연결함',
    async run (client = new Client, message = new Message, args = Array, sdb = MDB.object.server) {
        var pp = db.get(`dp.prefix.${message.member.id}`);
        if (pp == (null || undefined)) {
            await db.set(`db.prefix.${message.member.id}`, process.env.prefix);
            pp = process.env.prefix;
        }
        if (!(message.member.permissions.has('ADMINISTRATOR') || message.member.roles.cache.some(r=>sdb.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, Number(process.env.deletetime)));

        message.guild.channels.create(`🎵음악퀴즈`, { // ${client.user.username}-음악퀴즈채널
            type: 'text',
            topic: `정답은 채팅으로 치시면 됩니다.`
        }).then(async c => {
            sdb.musicquiz.mqchannelid = c.id;
            var anser = sdb.musicquiz.anser.list[sdb.musicquiz.anser.anser];
            var time = sdb.musicquiz.anser.time;
            var score = await msg.score();
            var list = await msg.list();
            var np = await msg.np(anser, time);
            c.send(score).then(async (m) => {
                sdb.musicquiz.msg.scoreid = m.id;
                await sdb.save().catch(err => console.log(err));
            });
            c.send(list).then(async (m) => {
                sdb.musicquiz.msg.listid = m.id;
                await sdb.save().catch(err => console.log(err));
            });
            c.send(np).then(async (m) => {
                sdb.musicquiz.msg.npid = m.id;
                await sdb.save().catch(err => console.log(err));
            });
        });
        return setTimeout(async () => {
            await mq.end(client, message, sdb);
        }, 3000);
    },
};

function msgdelete(m = new Message, t = Number) {
    setTimeout(() => {
        try {
            m.delete();
        } catch(err) {}
    }, t);
}
