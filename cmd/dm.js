
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, User } = require('discord.js');
const MDB = require('../MDB/data');

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
        return client.commands.get(`${this.name}`).run(client, message, args, sdb, user);
    }
    command
});
*/

const per = new MessageEmbed()
    .setTitle(`이 명령어를 사용할 권한이 없습니다.`)
    .setColor('RED');
const embed = new MessageEmbed()
    .setColor('ORANGE');

module.exports = {
    name: 'dm',
    aliases: ['디엠'],
    description: '봇 -> 유저 디엠 보내기',
    async run (client = new Client, message = new Message, args = Array, sdb = MDB.object.server, user = new User) {
        var pp = db.get(`dp.prefix.${message.member.id}`);
        if (pp == (null || undefined)) {
            await db.set(`db.prefix.${message.member.id}`, process.env.prefix);
            pp = process.env.prefix;
        }
        if (!(message.member.permissions.has('ADMINISTRATOR') || message.member.roles.cache.some(r=>sdb.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, Number(process.env.deletetime)));

        if (args[0]) {
            const tuser = message.guild.members.cache.get(args[0].replace(/[^0-9]/g, '')) || undefined;
            if (tuser) {
                const user = tuser.user;
                if (args[1]) {
                    var text = args.slice(1).join(' ');
                    tuser.send(text).catch(() => {
                        embed.setTitle(`\` ${user.username} \`의 dm 을 찾을수 없습니다.`)
                            .setColor('RED');
                        message.member.user.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)*2));
                    }).then(() => {
                        embed.setTitle(`\` ${user.username} \`에게 성공적으로 dm 을 보냈습니다.`)
                            .setDescription(`\` 내용 \`\n\n${text}`);
                        message.member.user.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)*2));
                    });
                    return;
                }
            }
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
