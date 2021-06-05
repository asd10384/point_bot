
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, User } = require('discord.js');
const MDB = require('../MDB/data');
const sdata = MDB.module.server();

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
var embed = new MessageEmbed()
    .setColor('ORANGE')
    .setFooter(`${process.env.prefix}포인트 도움말`);

module.exports = {
    name: 'point',
    aliases: ['포인트'],
    description: `${process.env.prefix}포인트 도움말`,
    async run (client = new Client, message = new Message, args = Array, user = new User) {
        var pp = db.get(`dp.prefix.${message.member.id}`);
        if (pp == (null || undefined)) {
            await db.set(`db.prefix.${message.member.id}`, process.env.prefix);
            pp = process.env.prefix;
        }

        embed = new MessageEmbed()
            .setColor('ORANGE')
            .setFooter(`${process.env.prefix}포인트 도움말`);

        if (args[0] == '확인') {
            if (!args[1]) {
                sdata.find({serverid: message.guild.id}, async (err, res) => {
                    var sdb = MDB.object.server;
                    var list = [];
                    for (i in res) {
                        sdb = res[i];
                        if (!list.includes(sdb.pointname)) {
                            list.push(sdb.pointname);
                        }
                    }
                    embed.setTitle(`**포인트 경기 확인**`)
                        .setDescription(`${list.join('\n')}`)
                        .setFooter(`${pp}포인트 도움말`);
                    return message.channel.send(embed);
                });
                return;
            }
            var getuser = message.guild.members.cache.get(args[1].replace(/[^0-9]/g, '')) || null;
            if (getuser) {
                sdata.find({serverid: message.guild.id, userid: getuser.user.id}, async (err, res) => {
                    var udb = MDB.object.server;
                    var total = 0;
                    var text = '';
                    for (i in res) {
                        udb = res[i];
                        text += `${udb.pointname} : ${udb.point}\n`;
                        total = total + Number(udb.point);
                    }
                    if (text === '') {
                        text = `없음`;
                    } else {
                        text += `\n합계 : ${total}`;
                    }
                    embed.setTitle(`**${getuser.user.username}님 포인트 확인**`)
                        .setDescription(text);
                    return message.channel.send(embed);
                });
                return;
            }
            return errmsg(message, pp, `유저를 찾을 수 없습니다.`);
        }
        if (args[0]) {
            if (['추가','지급'].includes(args[1])) {
                if (!(message.member.permissions.has('ADMINISTRATOR') || message.member.roles.cache.some(r=>sdb.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, Number(process.env.deletetime)));
                if (args[2]) {
                    var getuser = message.guild.members.cache.get(args[2].replace(/[^0-9]/g, '')) || null;
                    if (getuser) {
                        if (args[3]) {
                            if (!isNaN(args[3])) {
                                if (Number(args[3]) > 0) {
                                    var num = Number(args[3]);
                                    var point = sdata.findOne({
                                        serverid: message.guild.id,
                                        userid: getuser.user.id,
                                        pointname: args[0],
                                    });
                                    await point.then(async (db1) => {
                                        var udb = MDB.object.server;
                                        udb = db1;
                                        if (udb) {
                                            num = num + udb.point;
                                            udb.point = udb.point + Number(args[3]);
                                            udb.save().catch(err => console.log(err));
                                        } else {
                                            new sdata({
                                                serverid: message.guild.id,
                                                name: message.guild.name,
                                                userid: getuser.user.id,
                                                username: getuser.user.username,
                                                pointname: args[0],
                                                point: Number(args[3]),
                                            }).save().catch(err => console.log(err));
                                        }
                                    });
                                    embed.setTitle(`**포인트 지급 성공**`)
                                        .setDescription(`
                                            \` 지급된 경기 \` : ${args[0]}
                                            \` 지급된 유저 \` : <@${getuser.user.id}>
                                            \` 지금된 포인트 \` : ${args[3]}
                                            \` 최종 포인트 \` : ${num}
                                        `)
                                        .setFooter(`지금한 유저 : ${user.username}`);
                                    return message.channel.send(embed);
                                }
                                return errmsg(message, pp, `포인트는 1이상 지급 가능`);
                            }
                            var getuser_arg3 = message.guild.members.cache.get(args[2].replace(/[^0-9]/g, '')) || null;
                            if (getuser_arg3) {
                                var number = args[args.length-1];
                                var userlist = args.slice(2, -1);
                                if (!isNaN(number)) {
                                    if (Number(number) > 0) {
                                        var num = Number(number);
                                        var numlist = [];
                                        for (i in userlist) {
                                            var uid = userlist[i].replace(/[^0-9]/g, '');
                                            var point = sdata.findOne({
                                                serverid: message.guild.id,
                                                userid: uid,
                                                pointname: args[0],
                                            });
                                            await point.then(async (db1) => {
                                                var udb = MDB.object.server;
                                                udb = db1;
                                                if (udb) {
                                                    numlist.push(num + udb.point);
                                                    udb.point = udb.point + Number(number);
                                                    udb.save().catch(err => console.log(err));
                                                } else {
                                                    numlist.push(num);
                                                    new sdata({
                                                        serverid: message.guild.id,
                                                        name: message.guild.name,
                                                        userid: uid,
                                                        username: getuser.user.username,
                                                        pointname: args[0],
                                                        point: Number(number),
                                                    }).save().catch(err => console.log(err));
                                                }
                                            });
                                        }
                                        var text = ``;
                                        for (i in userlist) {
                                            text += `${userlist[i]} [최종 : ${numlist[i]}]\n`;
                                        }
                                        embed.setTitle(`**포인트 지급 성공**`)
                                            .setDescription(`
                                                \` 지급된 경기 \` : ${args[0]}
                                                \` 지금된 포인트 \` : ${number}
                                                \` 지급된 유저 \`
                                                ${text}
                                            `)
                                            .setFooter(`지금한 유저 : ${user.username}`);
                                        return message.channel.send(embed);
                                    }
                                    return errmsg(message, pp, `포인트는 1이상 지급 가능`);
                                }
                                return errmsg(message, pp, `포인트는 숫자만 입력가능`);
                            }
                            return errmsg(message, pp, `포인트는 숫자만 입력가능`);
                        }
                        return errmsg(message, pp, `포인트를 입력해주세요.`);
                    }
                    return errmsg(message, pp, `유저를 찾을 수 없습니다.`);
                }
                return errmsg(message, pp, `유저를 입력해주세요.`);
            }
            if (['차감','제거'].includes(args[1])) {
                if (!(message.member.permissions.has('ADMINISTRATOR') || message.member.roles.cache.some(r=>sdb.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, Number(process.env.deletetime)));
                if (args[2]) {
                    var getuser = message.guild.members.cache.get(args[2].replace(/[^0-9]/g, '')) || null;
                    if (getuser) {
                        if (args[3]) {
                            if (!isNaN(args[3])) {
                                if (Number(args[3]) > 0) {
                                    var num = Number(args[3]);
                                    var point = sdata.findOne({
                                        serverid: message.guild.id,
                                        userid: getuser.user.id,
                                        pointname: args[0],
                                    });
                                    if (point) {
                                        await point.then(async (db1) => {
                                            var udb = MDB.object.server;
                                            udb = db1;
                                            if (udb.point - num >= 0) {
                                                num = udb.point - num;
                                                udb.point = udb.point - Number(args[3]);
                                                udb.save().catch(err => console.log(err));

                                                embed.setTitle(`**포인트 차감 성공**`)
                                                    .setDescription(`
                                                        \` 차감된 경기 \` : ${args[0]}
                                                        \` 차감된 유저 \` : <@${getuser.user.id}>
                                                        \` 기존 포인트 \` : ${Number(args[3]) + num}
                                                        \` 차감된 포인트 \` : ${args[3]}
                                                        \` 최종 포인트 \` : ${num}
                                                    `)
                                                    .setFooter(`차감한 유저 : ${user.username}`);
                                                return message.channel.send(embed);
                                            } else {
                                                embed.setTitle(`**포인트 차감 오류**`)
                                                    .setDescription(`
                                                        \` 오류난 경기 \` : ${args[0]}
                                                        \` 오류난 유저 \` : <@${getuser.user.id}>
                                                        \` 오류난 포인트 \` : ${args[3]}
                                                        \` 오류난 유저의 보유 포인트 \` : ${udb.point}
                                                    `)
                                                    .setFooter(`차감한 유저 : ${user.username}`);
                                            return message.channel.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)*4));
                                            }
                                        });
                                        return;
                                    } else {
                                        embed.setTitle(`**포인트 차감 오류**`)
                                            .setDescription(`
                                                \` 오류난 경기 \` : ${args[0]}
                                                \` 오류난 유저 \` : <@${getuser.user.id}>
                                                \` 오류난 포인트 \` : ${args[3]}
                                                \` 오류난 유저의 보유 포인트 \` : 0
                                            `)
                                            .setFooter(`차감한 유저 : ${user.username}`);
                                        return message.channel.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)*4));
                                    }
                                }
                                return errmsg(message, pp, `포인트는 1이상 가능`);
                            }
                            var getuser_arg3 = message.guild.members.cache.get(args[2].replace(/[^0-9]/g, '')) || null;
                            if (getuser_arg3) {
                                var number = args[args.length-1];
                                var userlist = args.slice(2, -1);
                                if (!isNaN(number)) {
                                    if (Number(number) > 0) {
                                        var num = Number(number);
                                        var numlist = [];
                                        var succ = [];
                                        for (i in userlist) {
                                            var uid = userlist[i].replace(/[^0-9]/g, '');
                                            var point = sdata.findOne({
                                                serverid: message.guild.id,
                                                userid: uid,
                                                pointname: args[0],
                                            });
                                            await point.then(async (db1) => {
                                                var udb = MDB.object.server;
                                                udb = db1;
                                                if (udb.point - num >= 0) {
                                                    numlist.push(udb.point - num);
                                                    succ.push('성공');
                                                    udb.point = udb.point - num;
                                                    udb.save().catch(err => console.log(err));
                                                } else {
                                                    numlist.push(-1);
                                                    succ.push('실패');
                                                }
                                            });
                                        }
                                        var text = ``;
                                        for (i in userlist) {
                                            text += `${succ[i]} - ${userlist[i]} ${Number(numlist[i]) < 0 ? '' : `[최종 : ${numlist[i]}]`}\n`;
                                        }
                                        embed.setTitle(`**포인트 차감 성공**`)
                                            .setDescription(`
                                                \` 차감된 경기 \` : ${args[0]}
                                                \` 차감된 포인트 \` : ${number}
                                                \` 차감된 유저 \`
                                                ${text}
                                            `)
                                            .setFooter(`차감한 유저 : ${user.username}`);
                                        return message.channel.send(embed);
                                    }
                                    return errmsg(message, pp, `포인트는 1이상 지급 가능`);
                                }
                                return errmsg(message, pp, `포인트는 숫자만 입력가능`);
                            }
                            return errmsg(message, pp, `포인트는 숫자만 입력가능`);
                        }
                        return errmsg(message, pp, `포인트를 입력해주세요.`);
                    }
                    return errmsg(message, pp, `유저를 찾을 수 없습니다.`);
                }
                return errmsg(message, pp, `유저를 입력해주세요.`);
            }
            if (['순위','등수'].includes(args[1])) {
                if (args[2] && args[2] == '확인') {
                    sdata.find({serverid: message.guild.id, pointname: args[0]}, async (err, res) => {
                        var udb = MDB.object.server;
                        var obj = {};
                        for (i in res) {
                            udb = res[i];
                            obj[udb.userid] = udb.point;
                        }
                        var sort = Object.values(obj);
                        sort.sort((a, b) => {
                            return b - a;
                        });
                        var list = [];
                        for (i in sort) {
                            for (j in res) {
                                //if (Number(j)+1 > 10) break;
                                udb = res[j];
                                if (sort[i] == udb.point) {
                                    udb.point = 0;
                                    list.push(udb.userid);
                                }
                            }
                        }
                        var uname = user.username;
                        var uid = user.id;
                        if (args[3]) {
                            var getuser = message.guild.members.cache.get(args[3].replace(/[^0-9]/g, '')) || null;
                            if (!getuser) return errmsg(message, pp, `유저를 찾을 수 없습니다.`);
                            uname = getuser.user.username;
                            uid = getuser.user.id;
                        }
                        embed.setTitle(`${args[0]}경기 **${uname}님 등수 확인**`)
                            .setDescription(`${list.indexOf(uid)+1}등. <@${uid}> [${sort[list.indexOf(uid)]}]`);
                        return message.channel.send(embed);
                    });
                    return;
                }
                sdata.find({serverid: message.guild.id, pointname: args[0]}, async (err, res) => {
                    var udb = MDB.object.server;
                    // var obj = res.sort((a, b) => {
                    //     return b.point - a.point;
                    // });

                    var obj = {};
                    for (i in res) {
                        udb = res[i];
                        obj[udb.id] = udb.point;
                    }
                    var sort = Object.values(obj);
                    sort.sort((a, b) => {
                        return b - a;
                    });
                    var text = '';
                    var textf = '';
                    var textlist = [];
                    var allmember = 0;
                    for (i in sort) {
                        for (j in res) {
                            //if (Number(j)+1 > 10) break;
                            udb = res[j];
                            if (udb.point == 0) continue;
                            if (sort[i] == udb.point) {
                                udb.point = -1;
                                var getuserc = message.guild.members.cache.get(udb.userid) || null;
                                textf = `${Number(i)+1}등. ${(getuserc) ? (getuserc.nickname) ? getuserc.nickname : getuserc.user.username : udb.username} [${sort[i]}]\n`;
                                if (text.length + textf.length > 3990) {
                                    textlist.push(text);
                                    text = '';
                                }
                                allmember++;
                                text += textf;
                            }
                        }
                    }
                    textlist.push(text);
                    message.channel.send(`\`\`\`fix\n${args[0]}경기 **등수 확인** - 총 ${allmember}명\`\`\``);
                    for (i in textlist) {
                        message.channel.send(`\`\`\`${textlist[i]}\`\`\``);
                    }
                    // embed.setTitle(`${args[0]}경기 **등수 확인**`)
                    //     .setDescription(text);
                });
                return;
            }
        }
        return help(message, pp);
    },
};

function errmsg(message = new Message, pp = `${process.env.prefix}`, why = '') {
    embed.setTitle(`**포인트 에러**`)
        .setDescription(why)
        .setColor('RED');
        return message.channel.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)*2));
}
function help(message = new Message, pp = `${process.env.prefix}`) {
    embed.setTitle(`**포인트 도움말**`)
        /**
         * 포인트 [경기이름] 지급 [@유저] 숫자
         * 포인트 [경기이름] 차감 [@유저] 숫자
         */
        .setDescription(`
            **포인트 확인**
            ${pp}포인트 확인
             - 생성된 경기 확인
            ${pp}포인트 확인 [@유저]
             - 유저의 경기마다 포인트 확인
            
            **등수**
            ${pp}포인트 [경기이름] 등수
            - 경기 전체 등수 확인
            ${pp}포인트 [경기이름] 등수 확인
            - 경기 나의 등수 확인
            ${pp}포인트 [경기이름] 등수 확인 [@유저]
            - 경기 유저의 등수 확인
        `);
    return message.channel.send(embed);
}

function msgdelete(m = new Message, t = Number) {
    setTimeout(() => {
        try {
            m.delete();
        } catch(err) {}
    }, t);
}
