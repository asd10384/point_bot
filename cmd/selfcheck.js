
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, User } = require('discord.js');
const { hcs } = require('selfcheck');
const { format } = require('../module/mds');
const log = require('../log/log');

const MDB = require('../MDB/data');
const udata = MDB.module.user();

const per = new MessageEmbed()
    .setTitle(`이 명령어를 사용할 권한이 없습니다.`)
    .setColor('RED');
const embed = new MessageEmbed()
    .setColor('ORANGE');

module.exports = {
    name: 'selfcheck',
    aliases: ['자가진단'],
    description: `간편 자가진단 ${process.env.prefix}자가진단 도움말`,
    async run (client = new Client, message = new Message, args = Array, sdb = MDB.object.server, user = new User) {
        var pp = db.get(`dp.prefix.${message.member.id}`);
        if (pp == (null || undefined)) {
            await db.set(`db.prefix.${message.member.id}`, process.env.prefix);
            pp = process.env.prefix;
        }
        // if (!(message.member.permissions.has('ADMINISTRATOR') || message.member.roles.cache.some(r=>sdb.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, Number(process.env.deletetime)));

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
            var autotime = eval(process.env.autoselfcheck);
            var username = message.author.username;
            var sc = udb.selfcheck;
            var title = '';
            var desc = '';
            var color = undefined;
            if (!args[0]) {
                if (sc.name || sc.password) {
                    const emobj = await hcs({
                        area: sc.area,
                        school: sc.school,
                        name: sc.name,
                        birthday: sc.birthday,
                        password: sc.password
                    }).then((result) => {
                        return {
                            title: `성공`,
                            desc: `**\` 시간 \`** : ${result.inveYmd}`,
                            color: `ORANGE`,
                        }
                    }).catch(() => {
                        return {
                            title: `실패`,
                            desc: `\` ${pp}자가진단 확인 \`으로\n입력사항에 오류가있는지 확인해주세요.`,
                            color: `RED`,
                        }
                    });
                    title = emobj.title;
                    desc = emobj.desc;
                    color = emobj.color;
                    embed.setTitle(`**\` ${user.username} \`**님 자가진단 **${title}**`)
                        .setDescription(desc)
                        .setColor((color) ? color : 'ORANGE');
                    return message.channel.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)+2000));
                }
            }
            if (args[0] == '채널생성') {
                if (!(message.member.permissions.has('ADMINISTRATOR') || message.member.roles.cache.some(r=>sdb.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, Number(process.env.deletetime)));
                return message.guild.channels.create(`💬원터치자가진단`, { // ${client.user.username}-음악퀴즈채널
                    type: 'text',
                    topic: `${process.env.prefix}자가진단 도움말`
                }).then(channel => {
                    sdb.selfcheck.channelid = channel.id;
                    sdb.save().catch(err => console.log(err));
                    embed.setTitle(`**자가진단을 원터치로 간편하게**`)
                        .setDescription(`
                            이 메세지의 ⏭️ 이모지를 누르면
                            등록된 정보로 자가진단을 합니다.
                        `)
                        .setFooter(`도움말 : ${process.env.prefix}자가진단 도움말`);
                    channel.send(embed).then(m => {
                        m.react('⏭️');
                    });
                });
            }
            if (args[0] == '자동' || args[0] == 'auto') {
                if (args[1] == '확인' || args[1] == 'check') {
                    if (!(message.member.permissions.has('ADMINISTRATOR') || message.member.roles.cache.some(r=>sdb.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, Number(process.env.deletetime)));
                    var text = '';
                    for (i of sdb.selfcheck.autocheck) {
                        text += `<@${i}>\n`;
                    }
                    embed.setTitle(`**자동 자가진단**`)
                        .setDescription(`**유저 확인**\n${(text == '') ? `없음` : text}`)
                        .setFooter(`도움말 : ${process.env.prefix}자가진단 도움말`);
                    return message.channel.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)*2+2000));
                }
                if (args[1] == '실행' || args[1] == 'start') {
                    return await autocheckinterval(client, message, sdb, true);
                }
                if (!(sc.name || sc.password)) {
                    const emerr = new MessageEmbed()
                        .setTitle(`**자동 자가진단 오류**`)
                        .setDescription(`
                            먼저 **${process.env.prefix}자가진단 설정** 으로
                            정보를 등록한뒤 사용해주세요.
                        `)
                        .setFooter(`도움말 : ${process.env.prefix}자가진단 도움말`)
                        .setColor('RED');
                    return message.channel.send(emerr).then(m => msgdelete(m, Number(process.env.deletetime)));
                }
                var t = `활성화`;
                if (sdb.selfcheck.autocheck.includes(message.member.user.id)) {
                    sdb.selfcheck.autocheck.pop(sdb.selfcheck.autocheck.indexOf(message.member.user.id));
                    t = `비` + t;
                } else {
                    sdb.selfcheck.autocheck.push(message.member.user.id);
                }
                sdb.save().catch((err) => console.log(err));
                embed.setTitle(`**자동 자가진단**`)
                    .setDescription(`
                        **${message.member.user.username}** 님의 자동 자가진단이
                        **  ${t}** 되었습니다.

                        자동 자가진단은 매일 **오전 ${autotime[0]}시 ${autotime[1]}분** 마다
                        실행됩니다.  ([토, 일] 요일 제외)

                        자동 자가진단 성공 또는 실패 메세지도
                        이 메시지와 같이 DM 으로 날아옵니다.
                    `)
                    .setFooter(`도움말 : ${process.env.prefix}자가진단 도움말`);
                return user.send(embed).catch(() => {
                    message.channel.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)*3));
                }).then(m => msgdelete(m, Number(process.env.deletetime)*3));
            }
            if (args[0] == '설정') {
                if (args[1]) {
                    if (args[2]) {
                        if (args[3]) {
                            if (args[4]) {
                                if (args[5]) {
                                    sc.area = args[1];
                                    sc.school = args[2];
                                    sc.name = args[3];
                                    sc.birthday = args[4];
                                    sc.password = args[5];
                                    udb.selfcheck = sc;
                                    udb.save().catch(err => console.log(err));
                                    desc = `자가진단 정보가 정상적으로 등록되었습니다.\n\n**${pp}자가진단** 으로 자가진단을 하실수있습니다.\n**${pp}자가진단 확인** 으로 입력한 정보를 확인하실수 있습니다.`;
                                    return await sendem(message, embed, username, `성공`, desc, `ORANGE`, 5);
                                }
                                desc = `**비밀번호** 를 입력해주세요.\n자세한 내용은 **${pp}자가진단 설정** 을 확인해주세요.`;
                                return await sendem(message, embed, username, `오류`, desc, `RED`, 1);
                            }
                            desc = `**생일** 를 입력해주세요.\n자세한 내용은 **${pp}자가진단 설정** 을 확인해주세요.`;
                            return await sendem(message, embed, username, `오류`, desc, `RED`, 1);
                        }
                        desc = `**이름** 를 입력해주세요.\n자세한 내용은 **${pp}자가진단 설정** 을 확인해주세요.`;
                        return await sendem(message, embed, username, `오류`, desc, `RED`, 1);
                    }
                    desc = `**학교이름** 를 입력해주세요.\n자세한 내용은 **${pp}자가진단 설정** 을 확인해주세요.`;
                    return await sendem(message, embed, username, `오류`, desc, `RED`, 1);
                }
                embed.setTitle(`\` 자가진단 설정 \``)
                    .setDescription(`
                        \` 명령어 \`
                        ${pp}자가진단 설정 [1] [2] [3] [4] [5]
                        
                        \` 설명 \`
                        **[1] : 도시** (ex:부산) (풀네임(부산광역시)으로 적어도가능)
                        **[2] : 학교이름** (ex:부산남일고등학교) (마지막이 학교로 끝나야함)
                        **[3] : 이름** (ex:홍길동) (본인 실명)
                        **[4] : 생일** (ex:040102) (생일 6자리)
                        **[5] : 비밀번호** (ex:1111) (자가진단 비밀번호)
                    `)
                    .setColor('ORANGE');
                return message.channel.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)*3));
            }
            if (args[0] == '확인') {
                if (args[1]) {
                    const tuser = message.guild.members.cache.get(args[1].replace(/[^0-9]/g, '')).user || undefined;
                    if (!tuser) {
                        embed.setTitle(`유저를 찾을수 없습니다.`)
                            .setColor('RED');
                        return message.channel.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)));
                    }
                    udata.findOne({
                        userID: tuser.id
                    }, async (err, db2) => {
                        var udb2 = MDB.object.user;
                        udb2 = db2;
                        if (err) console.log(err);
                        if (!udb2) {
                            await MDB.set.user(tuser);
                            return client.commands.get(`${this.name}`).run(client, message, args, sdb, user);
                        }
                        udb2.name = user.username;
                        username = tuser.username;
                        sc = udb2.selfcheck;
                        await check(message, embed, username, sc);
                    });
                    return;
                }
                return await check(message, embed, username, sc);
            }

            // 자가진단 @USER
            if (args[0]) {
                const tuser = (message.guild.members.cache.get(args[0].replace(/[^0-9]/g, ''))) ? message.guild.members.cache.get(args[0].replace(/[^0-9]/g, '')).user : undefined;
                if (tuser) {
                    udata.findOne({
                        userID: tuser.id
                    }, async (err, udb2) => {
                        if (err) console.log(err);
                        if (!udb2) {
                            await MDB.set.user(tuser);
                            return client.commands.get(`${this.name}`).run(client, message, args, sdb, user);
                        }
                        udb2.name = user.username;
                        sc = udb2.selfcheck;
                        if (sc.name || sc.password) {
                            const emobj = await hcs({
                                area: sc.area,
                                school: sc.school,
                                name: sc.name,
                                birthday: sc.birthday,
                                password: sc.password
                            }).then((result) => {
                                return {
                                    title: `성공`,
                                    desc: `**\` 시간 \`** : ${result.inveYmd}`,
                                    color: `ORANGE`,
                                }
                            }).catch(() => {
                                return {
                                    title: `실패`,
                                    desc: `\` ${pp}자가진단 확인 \`으로\n입력사항에 오류가있는지 확인해주세요.`,
                                    color: `RED`,
                                }
                            });
                            title = emobj.title;
                            desc = emobj.desc;
                            color = emobj.color;
                            embed.setTitle(`**\` ${tuser.username} \`**님 자가진단 **${title}**`)
                                .setDescription(desc)
                                .setColor((color) ? color : 'ORANGE');
                            return message.channel.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)+2000));
                        } else {
                            embed.setTitle(`**\` ${tuser.username} \`**님 자가진단 **실패**`)
                                .setDescription(`
                                    ${tuser.username}님의 정보가 등록되어있지 않습니다.
                                    ${tuser.username}님이 먼저 **${pp}자가진단 설정**을 해주셔야 합니다.
                                `)
                                .setColor('RED');
                            return message.channel.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)+2000));
                        }
                    });
                    return;
                }
            }
            embed.setTitle(`\` 자가진단 도움말 \``)
                .setDescription(`
                    \` 명령어 \`
                    ${pp}자가진단 : 입력된 정보로 자가진단을 합니다.
                    ${pp}자가진단 설정 : 정보를 입력합니다.
                    ${pp}자가진단 확인 : 입력된 정보를 확인합니다.
                    ${pp}자가진단 자동 : 매일 오전 ${autotime[0]}시${autotime[1]}분에 자동으로 자가진단을 합니다.
                    (주말은 제외)

                    \` 관리자 명령어 \`
                    ${pp}자가진단 채널생성 : 자가진단을 원클릭으로 할수있는 채널을 생성합니다.
                    ${pp}자가진단 @USER : 유저가 입력한 정보로 자가진단을 합니다.
                    ${pp}자가진단 확인 @USER : 유저가 입력한 정보를 확인합니다.
                    ${pp}자가진단 자동 확인 : 자동 자가진단을 등록한 유저를 확인합니다.
                `)
                .setColor('ORANGE');
            return message.channel.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)*3));
        });
    },
    autocheckinterval: autocheckinterval,
};
async function autocheckinterval(client = new Client, message = new Message, sdb = MDB.object.server, go = false) {
    const timer = setInterval(async function() {
        var autotime = eval(process.env.autoselfcheck);
        var date = format.nowdate(new Date());
        var checktimer = db.get(`db.${message.guild.id}.selfcheck.timerstatus`);
        if (checktimer) {
            db.set(`db.${message.guild.id}.selfcheck.timerstatus`, false);
            var userid = db.get(`db.${message.guild.id}.selfcheck.timeruserid`);
            db.set(`db.${message.guild.id}.selfcheck.timeruserid`, '');
            var text = `** ${message.guild.name} 서버 **\n자동 자가진단 타이머가 실행중입니다.\n현재시간 : ${date.week}요일 ${date.hour}시 ${date.min}분 ${date.sec}초\n설정시간 : ${autotime[0]}시 ${autotime[1]}분`;
            log.botlog(message, text, new Date());
            var user = (message.guild.members.cache.get(userid)) ? message.guild.members.cache.get(userid).user : undefined;
            if (user) {
                user.send(new MessageEmbed().setDescription(text).setColor('ORANGE'))
                    .catch(() => {return;})
                    .then(m => msgdelete(m, Number(process.env.deletetime)*3));
            }
        }
        if (['토','일'].includes(date.week)) return ;
        if (date.hour == Number(autotime[0]) && date.min == Number(autotime[1]) && (date.sec == 0 || go)) {
            var userlist = sdb.selfcheck.autocheck;
            for (i = 0; i<userlist.length; i++) {
                var user = client.users.cache.get(userlist[i]) || undefined;
                udata.findOne({
                    userID: userlist[i]
                }, async (err, db1) => {
                    var udb = MDB.object.user;
                    udb = db1;
                    if (err) console.log(err);
                    if (!udb) {
                        if (user) {
                            await MDB.set.user(user);
                            clearInterval(timer);
                            return await autocheckinterval(client, message, sdb, true);
                        }
                    }
                    var sc = udb.selfcheck;
                    var emobj;
                    if (sc.name || sc.password) {
                        emobj = await hcs({
                            area: sc.area,
                            school: sc.school,
                            name: sc.name,
                            birthday: sc.birthday,
                            password: sc.password
                        }).then((result) => {
                            return {
                                title: `성공`,
                                desc: `**\` 시간 \`** : ${result.inveYmd}`,
                                time: result.inveYmd,
                                color: `ORANGE`,
                            };
                        }).catch(() => {
                            return {
                                title: `실패`,
                                desc: `\` ${process.env.prefix}자가진단 확인 \`으로\n입력사항에 오류가있는지 확인해주세요.`,
                                time: undefined,
                                color: `RED`,
                            };
                        });
                        var uname = (user) ? user.username : udb.name;
                        embed.setTitle(`**\` ${uname} \`**님 자동 자가진단 **${emobj.title}**`)
                            .setDescription(emobj.desc)
                            .setFooter(`서버 : ${message.guild.name}`)
                            .setColor(emobj.color);
                        if (user) {
                            user.send(embed);
                        } else {
                            var c = message.guild.channels.cache.get(sdb.selfcheck.channelid);
                            if (c) c.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)*4));
                        }
                    } else {
                        embed.setTitle(`**\` ${uname} \`**님 자동 자가진단 **실패**`)
                            .setDescription(`${uname}님의 정보가 등록되어있지 않습니다.\n${user.username}님이 먼저 **${process.env.prefix}자가진단 설정**을 해주셔야 합니다.`)
                            .setFooter(`서버 : ${message.guild.name}`)
                            .setColor('RED');
                        if (user) {
                            user.send(embed);
                        } else {
                            var c = message.guild.channels.cache.get(sdb.selfcheck.channelid);
                            if (c) c.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)*3));
                        }
                    }
                });
            }
        }
    }, 1000);
    return;
}

function msgdelete(m = new Message, t = Number) {
    setTimeout(() => {
        try {
            m.delete();
        } catch(err) {}
    }, t);
}

async function sendem(message = new Message, embed = new MessageEmbed, username = String, title = String, desc = String, color = String, time = Number) {
    embed.setTitle(`**\` ${username} \`**님 자가진단 설정 **${title}**`)
        .setDescription(desc)
        .setColor((color) ? color : 'ORANGE');
    return message.channel.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)+time));
}
async function check(message = new Message, embed = new MessageEmbed, username = String, sc = Object) {
    var text = '';
    var sc_arr = Object.keys(sc);
    for (i of sc_arr) {
        if (i == '$init') continue;
        text += `${i} : ${(i == 'password' && (sc[i] || !sc[i] == '')) ? "\\*\\*\\*\\*" : (!sc[i] || sc[i] == '') ? '설정되지 않음' : sc[i]}\n`;
    }
    embed.setTitle(`\` 자가진단 확인 \``)
        .setDescription(`
            **\` 유저이름 : ${username} \`**

            ${text}
        `)
        .setColor('ORANGE');
    return message.channel.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)*2));
}
