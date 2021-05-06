
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, User } = require('discord.js');
const MDB = require('../MDB/data');

const per = new MessageEmbed()
    .setTitle(`이 명령어를 사용할 권한이 없습니다.`)
    .setColor('RED');

module.exports = {
    name: 'role',
    aliases: ['권한'],
    description: '명령어 권한 설정',
    async run (client = new Client, message = new Message, args = Array, sdb = MDB.object.server, user = new User) {
        var pp = db.get(`dp.prefix.${message.member.id}`);
        if (pp == (null || undefined)) {
            await db.set(`db.prefix.${message.member.id}`, process.env.prefix);
            pp = process.env.prefix;
        }
        if (!(message.member.permissions.has('ADMINISTRATOR') || message.member.roles.cache.some(r=>sdb.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, Number(process.env.deletetime)));

        const emerr = new MessageEmbed()
            .setTitle(`오류발생`)
            .setColor('RED');
        const em = new MessageEmbed()
            .setColor('RANDOM');
        const help = new MessageEmbed()
            .setTitle(`\` 명령어 \``)
            .setDescription(`
                \` 관리자 명령어 \`
                ${pp}권한 확인 : 봇 관리자 명령어 권한을 확인합니다.
                ${pp}권한 추가 : 봇 관리자 명령어 권한을 추가합니다.
                ${pp}권한 제거 : 봇 관리자 명령어 권한을 제거합니다.
            `)
            .setColor('RANDOM');
        
        const msg_time = Number(process.env.deletetime);
        const help_time = Number(process.env.deletetime)*3;
        
        if (args[0] == '확인') {
            var roles = sdb.role;
            var text = '';
            for (i in roles) {
                text += `<@&${roles[i]}>\n`;
            }
            if (text == '' || text == undefined || text == null) {
                text = `**없음**`;
            }
            em.setTitle(`\` 봇 사용 권한 \``)
                .setDescription(text)
                .setFooter(`${pp}권한 명령어`);
            return message.channel.send(em).then(m => msgdelete(m, help_time - (help_time / 2)));
        }
        if (args[0] == '추가') {
            // 관리자인지 확인
            if (!(message.member.permissions.has('ADMINISTRATOR'))) return message.channel.send(per).then(m => msgdelete(m, Number(process.env.deletetime)));
            
            if (args[1]) {
                var roles = sdb.role || [];
                var role = message.guild.roles.cache.get(args[1].replace(/[^0-9]/g, '')).id;
                if (role) {
                    if (!roles.includes(role)) {
                        roles.push(role);
                        sdb.role = roles;
                        await sdb.save().catch(err => console.log(err));
                        em.setTitle(`역할을 성공적으로 추가했습니다.`)
                            .setDescription(`추가된 역할 : <@&${role}>`)
                            .setFooter(`${pp}권한 확인`);
                        return message.channel.send(em).then(m => msgdelete(m, help_time - (help_time / 2)));
                    }
                    emerr.setDescription(`이미 추가된 역할입니다.`);
                    return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
                }
                emerr.setDescription(`역할을 찾을수 없습니다.`);
                return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
            }
            emerr.setDescription(`${pp}권한 추가 @역할`);
            return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
        }
        if (args[0] == '제거') {
            // 관리자인지 확인
            if (!(message.member.permissions.has('ADMINISTRATOR'))) return message.channel.send(per).then(m => msgdelete(m, Number(process.env.deletetime)));
            
            if (args[1]) {
                var roles = sdb.role;
                var role = message.guild.roles.cache.get(args[1].replace(/[^0-9]/g, '')).id;
                if (role) {
                    if (roles.includes(role)) {
                        for (i=0; i<roles.length; i++) {
                            if (roles[i] == role) {
                                roles.splice(i, 1);
                            }
                        }
                        sdb.role = roles;
                        await sdb.save().catch(err => console.log(err));
                        em.setTitle(`역할을 성공적으로 제거했습니다.`)
                            .setDescription(`제거된 역할 : <@&${role}>`)
                            .setFooter(`${pp}권한 확인`);
                        return message.channel.send(em).then(m => msgdelete(m, help_time - (help_time / 2)));
                    }
                    emerr.setDescription(`이미 제거된 역할입니다.`);
                    return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
                }
                emerr.setDescription(`역할을 찾을수 없습니다.`);
                return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
            }
            emerr.setDescription(`${pp}권한 제거 @역할`);
            return message.channel.send(emerr).then(m => msgdelete(m, msg_time));
        }
        return message.channel.send(help).then(m => msgdelete(m, msg_time));
    },
};

function msgdelete(m = new Message, t = Number) {
    setTimeout(() => {
        try {
            m.delete();
        } catch(err) {}
    }, t);
}
