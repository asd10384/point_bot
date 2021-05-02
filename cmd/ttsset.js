
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message } = require('discord.js');
const MDB = require('../MDB/data');

const per = new MessageEmbed()
    .setTitle(`이 명령어를 사용할 권한이 없습니다.`)
    .setColor('RED');

module.exports = {
    name: 'ttsset',
    aliases: ['tts설정'],
    description: 'tts채널을 만들고 봇과 연결함',
    async run (client = new Client, message = new Message, args = Array, sdb = MDB.object.server) {
        var pp = db.get(`dp.prefix.${message.member.id}`);
        if (pp == (null || undefined)) {
            await db.set(`db.prefix.${message.member.id}`, process.env.prefix);
            pp = process.env.prefix;
        }
        const dfprefix = process.env.prefix;
        if (!(message.member.permissions.has('ADMINISTRATOR') || message.member.roles.cache.some(r=>sdb.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, Number(process.env.deletetime)));

        return message.guild.channels.create(`💬텍스트음성변환`, { // ${client.user.username}-음악퀴즈채널
            type: 'text',
            topic: `봇을 사용한뒤 ${dfprefix}leave 명령어를 입력해 내보내 주세요.`
        }).then(channel => {
            sdb.tts.ttschannelid = channel.id;
            sdb.save().catch(err => console.log(err));
            var tts = new MessageEmbed()
                .setTitle(`채팅을 읽어줍니다.`)
                .setDescription(`이 채팅방에 채팅을 치시면 봇이 읽어줍니다.`)
                .setFooter(`기본 명령어 : ${dfprefix}tts`)
                .setColor('ORANGE');
            channel.send(tts);
        });
    },
};

function msgdelete(m = new Message, t = Number) {
    setTimeout(() => {
        try {
            m.delete();
        } catch(err) {}
    }, t);
}
