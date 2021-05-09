
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, User } = require('discord.js');
const MDB = require('../MDB/data');

const { format, az } = require('../module/mds');

const per = new MessageEmbed()
    .setTitle(`이 명령어를 사용할 권한이 없습니다.`)
    .setColor('RED');

module.exports = {
    name: 'user',
    aliases: ['유저'],
    description: '유저정보 확인',
    async run (client = new Client, message = new Message, args = Array, sdb = MDB.object.server, user = new User) {
        var pp = db.get(`dp.prefix.${message.member.id}`);
        if (pp == (null || undefined)) {
            await db.set(`db.prefix.${message.member.id}`, process.env.prefix);
            pp = process.env.prefix;
        }
        // if (!(message.member.permissions.has('ADMINISTRATOR') || message.member.roles.cache.some(r=>sdb.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, Number(process.env.deletetime)));

        const help = new MessageEmbed()
            .setTitle(`\` 명령어 \``)
            .setDescription(`
                \` 명령어 \`
                ${pp}avatar : 자신의 정보 확인
                ${pp}avatar @User : 유저의 정보 확인
            `)
            .setColor('RANDOM');
        const embed = new MessageEmbed()
            .setColor('RANDOM');
        
        var roles = '';
        var datelist, date;
        var username, avatar, tag, id;
        
        if (!args[0]) {
            const user = message.member;
            user.roles.cache.forEach((role) => {
                roles += `${role.name}\n`;
            });
            datelist = format.date(user.joinedAt);
            date = `${datelist[0]}년 ${az(datelist[1], 2)}월 ${az(datelist[2], 2)}일`;

            username = user.user.username;
            avatar = user.user.displayAvatarURL();
            tag = message.author.tag;
            id = message.author.id;
        } else {
            var muser = message.guild.members.cache.get(args[0].replace(/[^0-9]/g, '')) || undefined;
            if (muser) {
                const user2 = muser;
                const member = message.guild.members.cache.get(user2.user.id);
    
                user2.roles.cache.forEach((role) => {
                    roles += `${role.name}\n`;
                });
                datelist = format.date(user2.joinedAt);
                date = `${datelist[0]}년 ${az(datelist[1], 2)}월 ${az(datelist[2], 2)}일`;

                username = user2.user.username;
                avatar = member.user.displayAvatarURL();
                tag = member.user.tag;
                id = member.user.id;
            } else {
                return message.channel.send(help).then(m => msgdelete(m, msg_time));
            }
        }
        embed.setTitle(`\` ${username} \` 정보`)
            .setThumbnail(avatar)
            .setDescription(`
                \` 태그 \`
                ${tag}

                \` 서버에 들어온 날짜 \`
                ${date}
                
                \` 아이디 \`
                ${id}
                
                \` 역할 \`
                ${roles}
            `);
        
        return message.channel.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)*3));
    },
};

function msgdelete(m = new Message, t = Number) {
    setTimeout(() => {
        try {
            m.delete();
        } catch(err) {}
    }, t);
}
