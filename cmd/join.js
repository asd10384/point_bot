
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message } = require('discord.js');
const MDB = require('../MDB/data');

const per = new MessageEmbed()
    .setTitle(`이 명령어를 사용할 권한이 없습니다.`)
    .setColor('RED');

module.exports = {
    name: 'join',
    aliases: ['참가'],
    description: '음성대화방에 참가',
    async run (client = new Client, message = new Message, args = Array, sdb = MDB.object.server) {
        var pp = db.get(`dp.prefix.${message.member.id}`);
        if (pp == (null || undefined)) {
            await db.set(`db.prefix.${message.member.id}`, process.env.prefix);
            pp = process.env.prefix;
        }
        // if (!(message.member.permissions.has('ADMINISTRATOR') || message.member.roles.cache.some(r=>sdb.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, Number(process.env.deletetime)));

        
        const help = new MessageEmbed()
            .setTitle(`${pp}join [voice channel id]`)
            .setColor('RANDOM');
        const vc = new MessageEmbed()
            .setTitle(`음성채널을 찾을수 없습니다.`)
            .setColor('RANDOM');

        if (!args[0]) return message.channel.send(help).then(m => msgdelete(m, Number(process.env.deletetime)));
        
        const channelid = args[0];
        const channel = client.channels.cache.get(channelid);
        try {
            channel.join();
        } catch (error) {
            return message.channel.send(vc).then(m => msgdelete(m, Number(process.env.deletetime)));
        }
    },
};

function msgdelete(m = new Message, t = Number) {
    setTimeout(() => {
        try {
            m.delete();
        } catch(err) {}
    }, t);
}
