
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

const em = new MessageEmbed()
    .setColor('ORANGE');
const err = new MessageEmbed()
    .setTitle(`**랜덤 오류**`)
    .setColor('RED');
const per = new MessageEmbed()
    .setTitle(`이 명령어를 사용할 권한이 없습니다.`)
    .setColor('RED');

module.exports = {
    name: 'random',
    aliases: ['랜덤'],
    description: '랜덤 [도움말]',
    async run (client = new Client, message = new Message, args = Array, sdb = MDB.object.server, user = new User) {
        var pp = db.get(`dp.prefix.${message.member.id}`);
        if (pp == (null || undefined)) {
            await db.set(`db.prefix.${message.member.id}`, process.env.prefix);
            pp = process.env.prefix;
        }
        // if (!(message.member.permissions.has('ADMINISTRATOR') || message.member.roles.cache.some(r=>sdb.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, Number(process.env.deletetime)));

        if (args[0] == '주사위') {
            em.setTitle(`**랜덤 주사위**`)
                .setDescription(`
                    **랜덤 숫자는?**
                    ${random({})}
                `);
            return message.channel.send(em).then(m => msgdelete(m, Number(process.env.deletetime)*2));
        }
        if (args[0]) {
            if (args[0].match(/^[0-9]+$/)) {
                if (args[1]) {
                    if (args[1].match(/^[0-9]+$/)) {
                        em.setTitle(`**랜덤 ${args[0]}~${args[1]}**`)
                            .setDescription(`
                                **랜덤 숫자는?**
                                ${random({
                                    min: Number(args[0]),
                                    max: Number(args[1]),
                                })}
                            `);
                        return message.channel.send(em).then(m => msgdelete(m, Number(process.env.deletetime)*3));
                    }
                    err.setDescription(`숫자만 사용할수 있습니다.`);
                    return message.channel.send(err).then(m => msgdelete(m, Number(process.env.deletetime)));
                }
                em.setTitle(`**랜덤 1~${args[0]}**`)
                    .setDescription(`
                        **랜덤 숫자는?**
                        ${random({
                            max: Number(args[0]),
                        })}
                    `);
                return message.channel.send(em).then(m => msgdelete(m, Number(process.env.deletetime)*3));
            }
            if (args[0] == '도움말' || args[0] == '명령어' || args[0] == 'help') return await help(message, pp);
            err.setDescription(`숫자(자연수)만 사용할수 있습니다.`);
            return message.channel.send(err).then(m => msgdelete(m, Number(process.env.deletetime)));
        }
        return await help(message, pp);
    },
};

async function help(message = new Message, pp = String || ';') {
    const help = new MessageEmbed()
        .setTitle(`**랜덤 도움말**`)
        .setDescription(`
            \` 명령어 \`
            ${pp}랜덤 [숫자] : 1~[숫자] 까지중에 랜덤한 정수
            ${pp}랜덤 [숫자1] [숫자2] [숫자1]~[숫자2] 까지중에 랜덤한 정수
            ${pp}랜덤 주사위 : 1~6중 랜덤
        `)
        .setColor('ORANGE');
    const m = await message.channel.send(help);
    return msgdelete(m, Number(process.env.deletetime) * 3);
}

function random({ min = 1, max = 6 }) {
    const rnum =  Math.floor(Math.random() * ((max+1) - min)) + min;
    var text = '\n';
    for (i of String(rnum)) {
        text += (i == 0) ? '0️⃣' : 
            (i == 1) ? '1️⃣' : 
            (i == 2) ? '2️⃣' : 
            (i == 3) ? '3️⃣' : 
            (i == 4) ? '4️⃣' : 
            (i == 5) ? '5️⃣' : 
            (i == 6) ? '6️⃣' : 
            (i == 7) ? '7️⃣' : 
            (i == 8) ? '8️⃣' :
            '9️⃣';
    }
    return text;
}

function msgdelete(m = new Message, t = Number) {
    setTimeout(() => {
        try {
            m.delete();
        } catch(err) {}
    }, t);
}
