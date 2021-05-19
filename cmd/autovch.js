
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, User } = require('discord.js');
const MDB = require('../MDB/data');
const log = require('../log/log');

/*
const MDB = require('../../MDB/data');
const udata = MDB.module.user();

udata.findOne({
    userID: user.id
}, async (err, db1) => {
    var udb = MDB.object.user;
    udb = db1;
    if (err) log.errlog(err);
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
    name: '자동음성채널',
    aliases: ['자음채','autovch'],
    description: '자동으로 음성채널을 생성합니다.',
    async run (client = new Client, message = new Message, args = Array, sdb = MDB.object.server, user = new User) {
        var pp = db.get(`dp.prefix.${message.member.id}`);
        if (pp == (null || undefined)) {
            await db.set(`db.prefix.${message.member.id}`, process.env.prefix);
            pp = process.env.prefix;
        }
        if (!(message.member.permissions.has('ADMINISTRATOR') || message.member.roles.cache.some(r=>sdb.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, Number(process.env.deletetime)));

        if (args[0] == '도움말') {
            return help(message, pp);
        }
        if (args[0] == '확인') {
            var text = '';
            var cart, vc;
            for (i in sdb.autovch.set) {
                cart = message.guild.channels.cache.get(sdb.autovch.set[i]['cart']);
                vc = message.guild.channels.cache.get(sdb.autovch.set[i]['vc']);
                console.log(cart);
                text += `${cart.name} **->** ${vc.name}\n`;
            }
            return message.channel.send(
                embed.setTitle(`**자동음성채널 확인**`)
                .setDescription((text == '') ? '없음' : text)
                .setFooter(`${pp}자동음성채널 도움말`)
            ).then(m => msgdelete(m, Number(process.env.deletetime)*3));
        }
        if (args[0] == '삭제' || args[0] == '제거') {
            if (args[1]) {
                var vc = message.guild.channels.cache.get(args[1]);
                if (vc) {
                    for (i in sdb.autovch.set) {
                        if (sdb.autovch.set[i]['vc'] === vc.id) sdb.autovch.set.pop(i);
                        sdb.save().catch((err) => log.errlog(err));
                        return message.channel.send(
                            embed.setTitle(`**${vc.name}채널 제거완료**`)
                            .setFooter(`${pp}자동음성채널 확인`)
                        ).then(m => msgdelete(m, Number(process.env.deletetime)*2));
                    }
                    return emerr(message, pp, `등록되지 않은 채널입니다.`);
                }
                return emerr(message, pp, `채널을 찾을수 없습니다.`);
            }
            return message.channel.send(
                embed.setTitle(`**자동음성채널 제거 도움말**`)
                .setDescription(`**명령어**\n${pp}자동음성채널 제거 [음성채널아아디]`)
                .setFooter(`${pp}자동음성채널 제거`)
            ).then(m => msgdelete(m, Number(process.env.deletetime)*2));
        }
        if (args[0] == '등록') {
            var vc = message.guild.channels.cache.get(args[1]);
            if (vc) {
                if (!vc.parentID) {
                    return emerr(message, pp, `음성채널을 카테고리에 넣은 뒤 사용해주세요.`);
                }
                if (args[2]) {
                    if (!isNaN(args[2])) {
                        if (Number(args[2]) >= 0 && Number(args[2] < 100)) {
                            sdb.autovch.set.push({cart: vc.parentID, vc: args[1], lim: Number(args[2])});
                            sdb.save().catch((err) => log.errlog(err));
                            return message.channel.send(
                                embed.setTitle(`자동음성채널에 \` **${vc.name}** \` 을 추가했습니다.`)
                            ).then(m => msgdelete(m, Number(process.env.deletetime)*2));
                        }
                        return emerr(message, pp, `멤버수는 0이상 100미만 까지 설정하실수 있습니다.\n(0은 무한)`);
                    }
                    return emerr(message, pp, `멤버수는 숫자만 사용할수 있습니다.`);
                }
                return emerr(message, pp, `멤버수를 입력해주세요.\n(0은 무한)`);
            }
            return emerr(message, pp, `음성채널을 찾을수없습니다.`);
        }
        return help(message, pp);
    },
};

async function emerr(message = new Message, pp = '', text = '') {
    embed.setTitle(`**자동음성채널 오류**`)
        .setDescription(text)
        .setFooter(`${pp}자동음성채널 도움말`)
        .setColor('RED');
    return message.channel.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)));
}

async function help(message = new Message, pp = '') {
    embed.setTitle(`**자동음성채널 도움말**`)
        .setDescription(`
            **관리자 명령어**
            ${pp}자동음성채널 도움말 : 도움말 확인
            ${pp}자동음성채널 확인 : 설정 확인
            ${pp}자동음성채널 등록 [음성채널아이디] [멤버수]
             : 등록한 음성채널에 유저가 들어가면 따로 음성채널방을 생성합니다.
             : 멤버수는 숫자로만 쓸수있습니다. (0 은 무한)
             : (등록할 음성채널은 꼭 카테고리안에 있어야합니다.)
            ${pp}자동음성채널 제거 [음성채널아이디]
             : 등록한 음성채널을 등록취소합니다.
        `);
    return message.channel.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)*6));
}

function msgdelete(m = new Message, t = Number) {
    setTimeout(() => {
        try {
            m.delete();
        } catch(err) {}
    }, t);
}
