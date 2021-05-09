
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

module.exports = {
    name: 'timercheck',
    aliases: ['타이머확인'],
    description: '자동으로 돌아가는\n타이머 확인',
    async run (client = new Client, message = new Message, args = Array, sdb = MDB.object.server, user = new User) {
        var pp = db.get(`dp.prefix.${message.member.id}`);
        if (pp == (null || undefined)) {
            await db.set(`db.prefix.${message.member.id}`, process.env.prefix);
            pp = process.env.prefix;
        }
        if (!(message.member.permissions.has('ADMINISTRATOR') || message.member.roles.cache.some(r=>sdb.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, Number(process.env.deletetime)));

        if (args[0] == '자가진단' || args[0] == 'selfcheck') {
            await db.set(`db.${message.guild.id}.selfcheck.timeruserid`, user.id);
            return await db.set(`db.${message.guild.id}.selfcheck.timerstatus`, true);
        }
        if (args[0] == 'ㅅㅅㄴ' || args[0] == 'tts') {
            await db.set(`db.${message.guild.id}.tts.timeruserid`, user.id);
            return await db.set(`db.${message.guild.id}.tts.timerstatus`, true);
        }
        var text = `**타이머확인**\n${process.env.prefix}타이머확인 자가진단\n${process.env.prefix}타이머확인 tts`;
        user.send(new MessageEmbed().setDescription(text).setColor('ORNAGE'))
            .catch(() => {return;})
            .then(m => msgdelete(m, Number(process.env.deletetime)*2));
    },
};

function msgdelete(m = new Message, t = Number) {
    setTimeout(() => {
        try {
            m.delete();
        } catch(err) {}
    }, t);
}
