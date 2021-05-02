
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message } = require('discord.js');
const { hcs } = require('selfcheck');

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
    description: '자동 자가진단',
    async run (client = new Client, message = new Message, args = Array, sdb = MDB.object.server) {
        var pp = db.get(`dp.prefix.${message.member.id}`);
        if (pp == (null || undefined)) {
            await db.set(`db.prefix.${message.member.id}`, process.env.prefix);
            pp = process.env.prefix;
        }
        // if (!(message.member.permissions.has('ADMINISTRATOR') || message.member.roles.cache.some(r=>sdb.role.includes(r.id)))) return message.channel.send(per).then(m => msgdelete(m, Number(process.env.deletetime)));

        udata.findOne({
            userID: message.member.user.id
        }, async (err, db) => {
            var udb = MDB.object.user;
            udb = db;
            if (err) console.log(err);
            if (!udb) {
                await MDB.set.user(message.member.user);
                return client.commands.get(`${this.name}`).run(client, message, args, sdb);
            }
            var username = message.author.username;;
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
                    }).catch((err) => {
                        return {
                            title: `실패`,
                            desc: `\` ${pp}자가진단 확인 \`으로\n입력사항에 오류가있는지 확인해주세요.`,
                            color: `RED`,
                        }
                    });
                    title = emobj.title;
                    desc = emobj.desc;
                    color = emobj.color;
                    embed.setTitle(`**\` ${message.author.username} \`**님 자가진단 **${title}**`)
                        .setDescription(desc)
                        .setColor((color) ? color : 'ORANGE');
                    return message.channel.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)+2000));
                }
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
                    const tuser = message.guild.members.cache.get(args[1].replace(/[^0-9]/g, '')) || undefined;
                    if (!tuser) {
                        embed.setTitle(`유저를 찾을수 없습니다.`)
                            .setColor('RED');
                        return message.channel.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)));
                    }
                    udata.findOne({
                        userID: tuser.id
                    }, async (err, udb2) => {
                        if (err) console.log(err);
                        if (!udb2) {
                            await MDB.set.user(tuser.user);
                            return client.commands.get(`${this.name}`).run(client, message, args, sdb);
                        }
                        username = tuser.user.username;
                        sc = udb2.selfcheck;
                        await check(message, embed, username, sc);
                    });
                    return;
                }
                return await check(message, embed, username, sc);
            }

            // 자가진단 @USER
            if (args[0]) {
                const tuser = message.guild.members.cache.get(args[0].replace(/[^0-9]/g, '')) || undefined;
                if (tuser) {
                    const user = tuser.user;
                    udata.findOne({
                        userID: tuser.id
                    }, async (err, udb2) => {
                        if (err) console.log(err);
                        if (!udb2) {
                            await MDB.set.user(user);
                            return client.commands.get(`${this.name}`).run(client, message, args, sdb);
                        }
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
                            }).catch((err) => {
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
                        } else {
                            embed.setTitle(`**\` ${user.username} \`**님 자가진단 **실패**`)
                                .setDescription(`
                                    ${user.username}님의 정보가 등록되어있지 않습니다.
                                    ${user.username}님이 먼저 **${pp}자가진단 설정**을 해주셔야 합니다.
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

                    \` 관리자 명령어 \`
                    ${pp}자가진단 @USER : 유저가 입력한 정보로 자가진단을 합니다.
                    ${pp}자가진단 확인 @USER : 유저가 입력한 정보를 확인합니다.
                `)
                .setColor('ORANGE');
            return message.channel.send(embed).then(m => msgdelete(m, Number(process.env.deletetime)*3));
        });
    },
};

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
