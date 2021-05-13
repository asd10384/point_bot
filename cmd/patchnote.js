
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, User } = require('discord.js');
const MDB = require('../MDB/data');

/*
const MDB = require('../../MDB/data');
const udata = MDB.module.user();

udata.findOne({
    userID: user.id
}, async (err, db1) => {
    var udb = MDB.object.user;
    udb = db1;
    if (err) console.log(err);
    if (!udb) {
        await MDB.set.user(user);
        return client.commands.get(`${this.name}`).run(client, message, args, sdb, user);
    }
    udb.name = user.username;
    command
});
*/

const per = new MessageEmbed()
    .setTitle(`이 명령어를 사용할 권한이 없습니다.`)
    .setColor('RED');
const embed = new MessageEmbed()
    .setColor('ORANGE');

module.exports = {
    name: 'patchnote',
    aliases: ['패치','패치노트'],
    description: '봇 패치노트',
    async run (client = new Client, message = new Message, args = Array, sdb = MDB.object.server, user = new User) {
        var pp = db.get(`dp.prefix.${message.member.id}`);
        if (pp == (null || undefined)) {
            await db.set(`db.prefix.${message.member.id}`, process.env.prefix);
            pp = process.env.prefix;
        }
        // if (!(message.member.permissions.has('ADMINISTRATOR') || message.member.roles.cache.some(r=>sdb.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, Number(process.env.deletetime)));

        if (args[0] == '도움말') {
            embed.setTitle(`**패치노트 도움말**`)
                .setDescription(`
                    ** \` 명령어 \` **
                    **패치노트 확인**
                    ${pp}패치노트
                    ${pp}패치 노트
                `);
            return message.channel.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)*3));
        }
        embed.setTitle(`**패치노트 확인하기**`)
            .setFooter(`글씨를 누르면 패치노트 사이트로 이동됩니다.`)
            .setURL(`${process.env.DOMAIN}/patchnote`);
        return message.channel.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)*4));
    },
};

function msgdelete(m = new Message, t = Number) {
    setTimeout(() => {
        try {
            m.delete();
        } catch(err) {}
    }, t);
}
