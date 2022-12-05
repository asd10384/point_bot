
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

        if (args[0] == '전체초기화') {
            const filter = ((response) => {
                return ['네','YES','아니요','NO'].some((answer) === response.content);
            })
            let checkem = new MessageEmbed()
                .setTitle(`**포인트 전체초기화**`)
                .setDescription(`초기화를 하시겠습니까?\n\n하신다면 채팅에 \` 네 \` 또는 \` YES \`\n안하신다면 채팅에 \` 아니요 \` 또는 \` NO \``)
                .setFooter(`10초안에 입력해주세요.`)
                .setColor('ORANGE');
            message.channel.send(checkem).then(() => {
                message.channel.awaitMessages(filter, { max: 1, time: 10 * 1000 }).then((collected) => {
                    sdata.remove({}).then(() => {
                        embed.setTitle(`**포인트 전체초기화**`)
                            .setDescription(`전체 초기화 완료`)
                            .setFooter(`${pp}포인트 도움말`);
                        return message.channel.send(embed);
                    }).catch((err) => {
                        embed.setTitle(`**포인트 전체초기화 오류**`)
                            .setDescription(`전체 초기화중 오류발생`)
                            .setFooter(`${pp}포인트 도움말`)
                            .setColor('RED');
                        return message.channel.send(embed);
                    })
                });
            });
        }

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
                    embed.setTitle(`**${(getuser.nickname) ? getuser.nickname : getuser.user.username}님 포인트 확인**`)
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
                                                username: (getuser.nickname) ? getuser.nickname : getuser.user.username,
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
                                        .setFooter(`지금한 유저 : ${(message.member.nickname) ? message.member.nickname : user.username}`);
                                    return message.channel.send(embed);
                                }
                                return errmsg(message, pp, `포인트는 1이상 지급 가능`);
                            }
                            var getuser_arg3 = message.guild.members.cache.get(args[2].replace(/[^0-9]/g, '')) || null;
                            if (getuser_arg3) {
                                var number = args[args.length-1];
                                var userlist = args.slice(2, -1);
                                userlist = userlist.filter((element, index) => {
                                    return userlist.indexOf(element) === index;
                                });
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
                                                    var getuser = message.guild.members.cache.get(uid) || null;
                                                    new sdata({
                                                        serverid: message.guild.id,
                                                        name: message.guild.name,
                                                        userid: uid,
                                                        username: (getuser.nickname) ? getuser.nickname : getuser.user.username,
                                                        pointname: args[0],
                                                        point: Number(number),
                                                    }).save().catch(err => console.log(err));
                                                }
                                            });
                                        }
                                        var textlist = [];
                                        var text = '';
                                        var textf = '';
                                        for (i in userlist) {
                                            var getuser = message.guild.members.cache.get(userlist[i].replace(/[^0-9]/g, '')) || null;
                                            textf = `. \* ${(getuser) ? (getuser.nickname) ? getuser.nickname : getuser.user.username : userlist[i]} [최종 : ${numlist[i]}]\n`;
                                            if (text.length + textf.length > 3990) {
                                                textlist.push(text);
                                                text = '';
                                            }
                                            text += textf;
                                        }
                                        textlist.push(text);
                                        
                                        message.channel.send(`\* **포인트 지급 성공** **\***\n \` 지급된 경기 \` : ${args[0]}\n \` 지급된 포인트 \` : ${number}\n \` 지급된 유저 \``);
                                        for (i in textlist) {
                                            message.channel.send(textlist[i]);
                                        }
                                        return;
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
                                                    .setFooter(`차감한 유저 : ${(message.member.nickname) ? message.member.nickname : user.username}`);
                                                return message.channel.send(embed);
                                            } else {
                                                embed.setTitle(`**포인트 차감 오류**`)
                                                    .setDescription(`
                                                        \` 오류난 경기 \` : ${args[0]}
                                                        \` 오류난 유저 \` : <@${getuser.user.id}>
                                                        \` 오류난 포인트 \` : ${args[3]}
                                                        \` 오류난 유저의 보유 포인트 \` : ${udb.point}
                                                    `)
                                                    .setFooter(`차감한 유저 : ${(message.member.nickname) ? message.member.nickname : user.username}`);
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
                                            .setFooter(`차감한 유저 : ${(message.member.nickname) ? message.member.nickname : user.username}`);
                                        return message.channel.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)*4));
                                    }
                                }
                                return errmsg(message, pp, `포인트는 1이상 가능`);
                            }
                            var getuser_arg3 = message.guild.members.cache.get(args[2].replace(/[^0-9]/g, '')) || null;
                            if (getuser_arg3) {
                                var number = args[args.length-1];
                                var userlist = args.slice(2, -1);
                                userlist = userlist.filter((element, index) => {
                                    return userlist.indexOf(element) === index;
                                });
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
                                        var textlist = [];
                                        var text = '';
                                        var textf = '';
                                        for (i in userlist) {
                                            var getuser = message.guild.members.cache.get(userlist[i].replace(/[^0-9]/g, '')) || null;
                                            textf = `. \* ${succ[i]} - ${(getuser) ? (getuser.nickname) ? getuser.nickname : getuser.user.username : userlist[i]} ${(Number(numlist[i]) >= 0) ? `[최종 : ${numlist[i]}]` : '[포인트부족]'}\n`;
                                            if (text.length + textf.length > 3990) {
                                                textlist.push(text);
                                                text = '';
                                            }
                                            text += textf;
                                        }
                                        textlist.push(text);
                                        
                                        message.channel.send(`\* **포인트 차감 성공** \*\n\` 차감된 경기 \` : ${args[0]}\n\` 차감된 포인트 \` : ${number}\n\` 차감된 유저 \``);
                                        for (i in textlist) {
                                            message.channel.send(textlist[i]);
                                        }
                                        return;
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
            if (['순위','등수','포인트'].includes(args[1])) {
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
                        var uname = (message.member.nickname) ? message.member.nickname : user.username;
                        var uid = user.id;
                        if (args[3]) {
                            var getuser = message.guild.members.cache.get(args[3].replace(/[^0-9]/g, '')) || null;
                            if (!getuser) return errmsg(message, pp, `유저를 찾을 수 없습니다.`);
                            uname = (getuser.nickname) ? getuser.nickname : getuser.user.username;
                            uid = getuser.user.id;
                        }
                        embed.setTitle(`${args[0]}경기 **${uname}님 포인트 확인**`)
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
                            // if (udb.point == 0) continue;
                            if (sort[i] == udb.point) {
                                textf = '';
                                udb.point = -1;
                                var getuserc = message.guild.members.cache.get(udb.userid) || null;
                                if (String(Number(i)+1).length < String(sort.length).length) {
                                    for (az=0; az<String(sort.length).length-String(Number(i)+1).length; az++) {
                                        textf += '0';
                                    }
                                }
                                textf += `${Number(i)+1}등. ${(getuserc) ? (getuserc.nickname) ? getuserc.nickname : getuserc.user.username : udb.username} [${sort[i]}]\n`;
                                if (text.length + textf.length > 1900) {
                                    textlist.push(text);
                                    text = '';
                                }
                                allmember++;
                                text += textf;
                            }
                        }
                    }
                    textlist.push(text);
                    message.channel.send(`\`\`\`fix\n${args[0]}경기 **포인트 확인** - 총 ${allmember}명\`\`\``);
                    for (i in textlist) {
                        message.channel.send(`\`\`\`${(textlist[i]) ? textlist[i] : '없음'}\`\`\``);
                    }
                    // embed.setTitle(`${args[0]}경기 **포인트 확인**`)
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
         * 포인트 전체초기화
         */
        .setDescription(`
            **포인트 확인**
            ${pp}포인트 확인
             - 생성된 경기 확인
            ${pp}포인트 확인 [@유저]
             - 유저의 경기마다 포인트 확인
            
            **포인트**
            ${pp}포인트 [경기이름] 포인트 (등수)
            - 경기 전체 포인트 확인
            ${pp}포인트 [경기이름] 포인트 확인
            - 경기 나의 포인트 확인
            ${pp}포인트 [경기이름] 포인트 확인 [@유저]
            - 경기 유저의 포인트 확인
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
