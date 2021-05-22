
require('dotenv').config();
const db = require('quick.db');
const request = require('request');
const { load } = require('cheerio');
const ytdl = require('ytdl-core');
const { MessageEmbed, Client, Message, Channel, User } = require('discord.js');
const MDB = require('../../MDB/data');
const log = require('../../log/log');

const mqscore = require('./score');
const msg = require('./msg');
const { play, broadcast } = require('../tts/play');

const chack = /(?:http:\/\/|https:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?/gi;

const emerr = new MessageEmbed()
    .setTitle(`**퀴즈 오류**`)
    .setColor('RED');

module.exports = {
    end,
    start,
    anser,
    start_em,
    allmsgdelete,
    timer,
    musicplay,
    ready,
};

async function end(client = new Client, message = new Message, sdb = MDB.object.server) {
    db.set(`db.${message.guild.id}.quiz.startcheck`, false);
    db.set(`db.${message.guild.id}.mq.timer`, false);
    db.set(`db.${message.guild.id}.img.timer`, false);
    db.set(`db.${message.guild.id}.img.time`, sdb.quiz.anser.imgtime);
    sdb.quiz.start.userid = '';
    sdb.quiz.quiz.name = [];
    sdb.quiz.quiz.vocal = [];
    sdb.quiz.quiz.link = [];
    sdb.quiz.quiz.count = 0;

    sdb.quiz.user.hint = [];
    sdb.quiz.user.skip = [];

    sdb.quiz.start.start = false;
    sdb.quiz.start.embed = false;
    sdb.quiz.start.user = false;
    sdb.quiz.start.hint = false;

    sdb.quiz.page.click = 0;
    sdb.quiz.page.now = 0;
    sdb.quiz.page.slide = 0;
    sdb.quiz.page.p1 = 0;
    sdb.quiz.page.p2 = 0;
    sdb.quiz.page.p3 = 0;
    sdb.quiz.page.p4 = 0;

    sdb.tts.tts = true;

    await sdb.save();
    var time = sdb.quiz.anser.time;
    var list = await msg.list();
    var np = await msg.np(time);
    try {
        message.guild.me.voice.channel.leave();
    } catch(err) {}
    try {
        client.channels.cache.get(sdb.quiz.vcid).leave();
    } catch(err) {}
    var c;
    try {
        c = client.channels.cache.get(sdb.quiz.qzchannelid);
    } catch(err) {}
    try {
        c.messages.fetch(sdb.quiz.msg.listid).then(m => {
            m.edit(list);
        });
        c.messages.fetch(sdb.quiz.msg.npid).then(m => {
            m.edit(np);
            m.reactions.removeAll();
        });
    } catch(err) {}

    await allmsgdelete(client, sdb, 1000);
}
async function start(client = new Client, message = new Message, args = Array, sdb = MDB.object.server, vchannel = new Channel, user = new User) {
    sdb.quiz.start.userid = user.id;
    await start_em(client, message, args, sdb, vchannel, user, {
        first: true,
    });
    await db.set(`db.${message.guild.id}.mq.timer`, true);
}
async function start_em(client = new Client, message = new Message, args = Array, sdb = MDB.object.server, vchannel = new Channel, user = new User, opt = {
    first: Boolean,
}) {
    var data = sdb.quiz;
    const url = `${process.env.mqsite}/music_list.js`;
    request(url, async (err, res, body) => {
        if (!err) {
            var dflist = eval(body)[0];
            var text = [`\n`];

            if (opt.first) {
                data.page.slide = 0;
                data.page.now = 1;
                data.page.p1 = 0;
                try {
                    var c = client.channels.cache.get(data.qzchannelid);
                    c.messages.fetch(data.msg.npid).then(m => {
                        m.reactions.removeAll();
                        m.react('⬅️');
                        m.react('1️⃣');
                        m.react('2️⃣');
                        m.react('3️⃣');
                        m.react('4️⃣');
                        m.react('5️⃣');
                        m.react('↩️');
                        m.react('➡️');
                    });
                } catch(err) {}
            }
            var ulist;
            var keys1, keys2, keys3, keys4;
            if (data.page.now >= 1) {
                try {
                    keys1 = Object.keys(dflist);
                } catch(err) {
                    keys1 = undefined;
                }
                ulist = dflist;
                if (data.page.now >=2) {
                    try {
                        keys2 = Object.keys(
                            dflist[
                                keys1[data.page.p1-1]
                            ]
                        );
                    } catch(err) {
                        keys2 = undefined;
                    }
                    ulist = dflist[
                        keys1[data.page.p1-1]
                    ];
                    if (data.page.now >=3) {
                        try {
                            var keys3 = Object.keys(
                                dflist[
                                    keys1[data.page.p1-1]
                                ][
                                    keys2[data.page.p2-1]
                                ]
                            );
                        } catch(err) {
                            keys3 = undefined;
                        }
                        ulist = dflist[
                            keys1[data.page.p1-1]
                        ][
                            keys2[data.page.p2-1]
                        ];
                        if (data.page.now >=4) {
                            try {
                                keys4 = Object.keys(
                                    dflist[
                                        keys1[data.page.p1-1]
                                    ][
                                        keys2[data.page.p2-1]
                                    ][
                                        keys3[data.page.p3-1]
                                    ]
                                );
                            } catch(err) {
                                keys4 = undefined;
                            }
                            ulist = dflist[
                                keys1[data.page.p1-1]
                            ][
                                keys2[data.page.p2-1]
                            ][
                                keys3[(data.page.slide*5)+data.page.p3-1]
                            ];
                            if (data.page.now >=5) {
                                if (data.page.click == 1) {
                                    data.page.now = 1;
                                    data.page.click = 0;
                                    data.page.p1 = 0;
                                    data.page.p2 = 0;
                                    data.page.p3 = 0;
                                    data.page.p4 = 0;
                                    await db.set(`db.${message.guild.id}.mq.timer`, false);
                                    return await ready(client, message, args, sdb, vchannel, user, ulist);
                                }
                                data.page.now = 3;
                                data.page.p4 = 0;
                                ulist = dflist[
                                    keys1[data.page.p1-1]
                                ][
                                    keys2[data.page.p2-1]
                                ];
                            }
                        }
                    }
                }
            }
            if (!ulist) {
                data.page.now = data.page.now-1;
                data.page.slide = 0;
                return sdb.save();
            }
            sdb.save();
            var slide = data.page.slide;
            if (data.page.now == 4) {
                slide = 0;
                var urllist = ulist.url.split('/');
                text[0] = `**이름** : ${urllist[urllist.length-1].replace('.html','')}\n**형식** : ${(ulist.quiz.music) ? `음악퀴즈` : (ulist.quiz || !ulist.quiz == '') ? ulist.quiz : `지정되지 않음`}\n**설명** : ${(ulist.desc || !ulist.desc == '') ? ulist.desc : `설명이 없습니다.`}\n**완성도** : ${(ulist.complite === 100) ? `완성` : (ulist.complite === 0) ? `미완성` : `${ulist.complite}%`}\n\n1️⃣ 시작하기\n2️⃣ 뒤로가기\n`;
            } else {
                var uname = Object.keys(ulist);
                var i = 0, it = '', p = 0;
                while (i < uname.length) {
                    it = bignum((i+1)-(p*5));
                    if (!text[p]) text[p] = '\n';
                    text[p] += `${it}  ${uname[i]}\n`;
                    i++;
                    if (i % 5 == 0) p++;
                }
                if (slide < 0) slide = 0;
                if (slide > text.length-1) slide = text.length-1;
            }
            const np = new MessageEmbed()
                .setTitle(`** [퀴즈 선택화면 ]**`)
                .setDescription(`
                    **\` 아래 숫자를 눌러 선택해주세요. \`**

                    ${text[slide]}
                        
                    (아래 이모지가 전부 로딩된 뒤 선택해주세요.)
                `)
                .setFooter(`기본 명령어 : ${process.env.prefix}음악퀴즈 도움말`)
                .setColor('ORANGE');
            try {
                var c = client.channels.cache.get(data.qzchannelid);
                c.messages.fetch(data.msg.npid).then(m => {
                    m.edit(np);
                });
            } catch(err) {}
        } else {
            return await end(client, message, sdb);
        }
    });
    return;
}
async function anser(client = new Client, message = new Message, args = Array, sdb = MDB.object.server, user = new User) {
    db.set(`db.${message.guild.id}.mq.timer`, true);
    db.set(`db.${message.guild.id}.img.timer`, false);
    db.set(`db.${message.guild.id}.img.time`, 45);

    allmsgdelete(client, sdb, 500);
    
    sdb.quiz.start.user = false;
    sdb.quiz.start.hint = false;
    sdb.quiz.user.hint = [];
    sdb.quiz.user.skip = [];

    try {
        var anser_user = user.username;
        if (args[0] == '스킵' || args[0] == 'skip') {
            anser_user = (args[1] == '시간초과') ? '시간초과로 스킵되었습니다.' : (args[1] == '관리자') ? `${message.member.user.username} 님이 강제로 스킵했습니다.` : '스킵하셨습니다.';
            sdb.quiz.quiz.skipcount = sdb.quiz.quiz.skipcount+1;
        } else {
            var score = db.get(`db.${message.guild.id}.quiz.score`);
            if (!score) score = {};
            if (score[user.id]) {
                score[user.id] = score[user.id] + 1;
            } else {
                score[user.id] = 1;
            }
            db.set(`db.${message.guild.id}.quiz.score`, score);
        }
        var time = sdb.quiz.anser.time;
        var count = sdb.quiz.quiz.count;
        var all_count = sdb.quiz.quiz.name.length;
        var name = sdb.quiz.quiz.name[count];
        var vocal = sdb.quiz.quiz.vocal[count];
        var link = sdb.quiz.quiz.link[count];
        var format = sdb.quiz.quiz.format;
        var yturl = link.replace(chack, '').replace(/(?:&(.+))/gi, '');
        var list = `퀴즈를 종료하시려면 \` ${process.env.prefix}퀴즈 종료 \`를 입력해주세요.`;
        var np = new MessageEmbed();
        
        if (format == '음악퀴즈') {
            vocal = `**가수 : ${vocal}**`;
            np.setImage(`https://img.youtube.com/vi/${yturl}/sddefault.jpg`);
        }
        if (format == '그림퀴즈') {
            np.setImage(link);
            await broadcast(message, sdb, message.guild.me.voice.channel, `sound/dingdong.mp3`, {volume:0.5});
        }
        np.setTitle(`**정답 : ${name}**`)
            .setURL(link)
            .setDescription(`
                **${vocal}**
                **정답자 : ${anser_user}**
                **문제 : ${count+1} / ${all_count}**
            `)
            .setFooter(`${time}초 뒤에 다음문제로 넘어갑니다.`)
            .setColor('ORANGE');
        
        try {
            var c = client.channels.cache.get(sdb.quiz.qzchannelid);
            c.messages.fetch(sdb.quiz.msg.listid).then(m => {
                m.edit(list);
            });
            c.messages.fetch(sdb.quiz.msg.npid).then(m => {
                m.edit(np);
            });
        } catch(err) {}
        sdb.quiz.quiz.count = sdb.quiz.quiz.count+1;
        await sdb.save();

        await mqscore.score(client, message, args, sdb);

        setTimeout(async function () {
            var startcheck = db.get(`db.${message.guild.id}.quiz.startcheck`);
            if (!startcheck) return ;
            await allmsgdelete(client, sdb, 50);
            db.set(`db.${message.guild.id}.mq.timer`, false);
            var vchannel;
            try {
                vchannel = message.guild.me.voice.channel;
            } catch(err) {
                vchannel = client.channels.cache.get(sdb.quiz.vcid);
            }
            if (format == '음악퀴즈') await musicplay(client, message, args, sdb, vchannel, user);
            if (format == '그림퀴즈') await imgplay(client, message, args, sdb, vchannel, user);
            return;
        }, time * 1000);
    } catch(err) {
        log.errlog(err);
        return await end(client, message, sdb);
    }
}

async function timer(client = new Client, message = new Message, sdb = MDB.object.server) {
    const ontimer = setInterval(async () => {
        var ts = db.get(`db.${message.guild.id}.mq.timer`) || false;
        if (!ts) {
            return clearInterval(ontimer);
        }
        if (!(!!message.guild.me.voice.channel)) {
            await end(client, message, sdb);
            return clearInterval(ontimer);
        }
    }, 1000);
}
async function imgtimer(client = new Client, message = new Message, sdb = MDB.object.server, count = Number, all_count = Number, img = String) {
    const ontimer = setInterval(async () => {
        var ts = db.get(`db.${message.guild.id}.img.timer`) || false;
        var time = db.get(`db.${message.guild.id}.img.time`);
        if (time == null || undefined) time = sdb.quiz.anser.imgtime;
        if (ts) {
            if (time <= 0) {
                db.set(`db.${message.guild.id}.img.timer`, false);
                db.set(`db.${message.guild.id}.img.time`, sdb.quiz.anser.imgtime);
                await anser(client, message, ['스킵'], sdb, user);
                return clearInterval(ontimer);
            }
            if (time % 5 == 0 || (time < 10 && time % 2 == 1 && time > 3) || time < 3) {
                var np = new MessageEmbed()
                    .setTitle(`**정답 : ???**`)
                    .setDescription(`**남은시간 : ${time}**\n**문제 : ${count+1}/${all_count}**`)
                    .setImage(img)
                    .setFooter(`기본 명령어 : ${process.env.prefix}퀴즈 도움말`)
                    .setColor('ORANGE');
            
                try {
                    var c = client.channels.cache.get(sdb.quiz.qzchannelid);
                    c.messages.fetch(sdb.quiz.msg.npid).then(m => {
                        m.edit(np);
                    });
                } catch(err) {}
            }
        } else {
            return clearInterval(ontimer);
        }
        db.set(`db.${message.guild.id}.img.time`, time-1);
    }, 1000);
}

function bignum(num=1) {
    return num == 1 ? '1️⃣' : num == 2 ? '2️⃣' : num == 3 ? '3️⃣' : num == 4 ? '4️⃣' : '5️⃣';
}

async function allmsgdelete(client = new Client, sdb = MDB.object.server, time = Number || 50) {
    try {
        var c = client.channels.cache.get(sdb.quiz.qzchannelid);
        setTimeout(async function() {
            await c.messages.fetch({ after: sdb.quiz.msg.npid }).then(async function(msg) {
                if (msg.size <= 1) return;
                await c.bulkDelete(msg.size);
            });
        }, time);
    } catch(err) {
        return;
    }
    return;
}

async function ready(client = new Client, message = new Message, args = Array, sdb = MDB.object.server, vchannel = new Channel, user = new User, ulist = {
    url: String,
    desc: String,
    quiz: String,
    complite: Number,
}) {
    if (!ulist.start) {
        await end(client, message, sdb);
        emerr.setDescription(`아직 이 퀴즈가 완성되지 않았습니다.`);
        return setTimeout(async () => {
            return message.channel.send(emerr).then(m => msgdelete(m, Number(process.env.deletetime)));
        }, 1250);
    }
    db.set(`db.${message.guild.id}.quiz.startcheck`, true);
    db.set(`db.${message.guild.id}.quiz.score`, {});
    sdb.quiz.start.userid = '';
    sdb.quiz.quiz.format = ulist.quiz;
    sdb.quiz.start.user = false;
    sdb.quiz.user.hint = [];
    sdb.quiz.user.skip = [];
    sdb.quiz.quiz.skipcount = 0;
    sdb.save();
    var list = `**잠시뒤 퀴즈가 시작됩니다.**`;
    try {
        var c = client.channels.cache.get(sdb.quiz.qzchannelid);
        c.messages.fetch(sdb.quiz.msg.listid).then(m => {
            m.edit(list);
        });
        c.messages.fetch(sdb.quiz.msg.npid).then(m => {
            m.reactions.removeAll();
            m.react('💡');
            m.react('⏭️');
        });
    } catch(err) {}
    await mqscore.score(client, message, args, sdb);
    return await getquiz(client, message, args, sdb, vchannel, user, ulist);
}
async function getquiz(client = new Client, message = new Message, args = Array, sdb = MDB.object.server, vchannel = new Channel, user = new User, ulist = {
    url: String,
    desc: String,
    quiz: String,
    complite: Boolean,
}) {
    if (ulist.quiz == '음악퀴즈') {
        return await tensec(client, message, args, sdb, vchannel, user, ulist, {
            desc: `나오는 노래를 듣고 정답을 채팅창에 적어주세요.\n정답이면 자동으로 넘어갑니다.`
        });
    }
    if (ulist.quiz == '그림퀴즈') {
        return await tensec(client, message, args, sdb, vchannel, user, ulist, {
            desc: `나오는 이미지를 보고 정답을 채팅창에 적어주세요.\n정답이면 자동으로 넘어갑니다.`
        });
    }
    await end(client, message, sdb);
    emerr.setDescription(`퀴즈 형식을 찾을수 없습니다.`);
    return setTimeout(async () => {
        return message.channel.send(emerr).then(m => msgdelete(m, Number(process.env.deletetime)));
    }, 1250);
}
async function tensec(client = new Client, message = new Message, args = Array, sdb = MDB.object.server, vchannel = new Channel, user = User, ulist = {
    url: String,
    desc: String,
    quiz: String,
    complite: Boolean,
}, text = {
    desc: String,
}) {
    await broadcast(message, sdb, vchannel, `sound/dingdong.mp3`, {volume:0.5});
    const np = new MessageEmbed()
        .setTitle(`**${ulist.quiz} 설명**`)
        .setImage(`https://ytms.netlify.app/question_mark.png`)
        .setDescription(`
            ${text.desc}

            퀴즈는 10초뒤 자동 시작됩니다.
        `)
        .setFooter(`자세한 설정은 ${process.env.prefix}퀴즈 설정 으로 하실수 있습니다.`)
        .setColor('ORANGE');
    try {
        var c = client.channels.cache.get(sdb.quiz.qzchannelid);
        return c.messages.fetch(sdb.quiz.msg.npid).then(m => {
            m.edit(np);
            setTimeout(async function() {
                if (ulist.quiz == '음악퀴즈') return await getmusic(client, message, args, sdb, vchannel, user, ulist);
                if (ulist.quiz == '그림퀴즈') return await getimg(client, message, args, sdb, vchannel, user, ulist);
            }, 10000);
        });
    } catch(err) {
        return await end(client, message, sdb);
    }
}
async function getimg(client = new Client, message = new Message, args = Array, sdb = MDB.object.server, vchannel = new Channel, user = new User, ulist = {
    url: String,
    desc: String,
    quiz: String,
    complite: Boolean,
}) {
    request(ulist.url.toString().toLocaleLowerCase().replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|\s]/g, encodeURIComponent), async (err, res, html) => {
        if (!html) {
            await end(client, message, sdb);
            emerr.setDescription(`HTML을 찾을수 없습니다.`);
            return setTimeout(async () => {
                return message.channel.send(emerr).then(m => msgdelete(m, Number(process.env.deletetime)));
            }, 1250);
        }
        const $ = load(html);
        var dfname = [],
            dfvocal = [],
            dflink = [];
        $('body div.music div').each(async function () {
            dfname.push($(this).children('a.name').text().trim());
            dfvocal.push($(this).children('a.vocal').text().trim());
            dflink.push(process.env.mqsite + $(this).children('a.link').attr('href').trim().replace('../..','').replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|\s]/g, encodeURIComponent));
        });
        var rndlist = [],
            name = [],
            vocal = [],
            link = [];
        var count = dfname.length;
        if (count > 50) count = 50;
        var logtext = '';
        for (i=0; i<count; i++) {
            var r = Math.floor(Math.random()*(dfname.length+1));
            if (r >= 50 || rndlist.includes(r) || dfname[r] == '' || dfname[r] == undefined) {
                i--;
                continue;
            }
            rndlist.push(r);
            name.push(dfname[r]);
            vocal.push(dfvocal[r]);
            link.push(dflink[r]);
            logtext += `${i+1}. ${dfvocal[r]}-${dfname[r]} [${r+1}]\n`;
        }
        log.quizlog(message, logtext, new Date());
        var img = sdb.quiz;
        img.quiz.name = name;
        img.quiz.vocal = vocal;
        img.quiz.link = link;
        img.quiz.count = 0;
        img.start.start = true;
        img.start.user = false;
        sdb.quiz = img;
        await sdb.save();
        return await imgplay(client, message, args, sdb, vchannel, user);
    });
    return;
}
async function imgplay(client = new Client, message = new Message, args = Array, sdb = MDB.object.server, vchannel = new Channel, user = new User) {
    sdb.tts.tts = false;
    sdb.quiz.start.start = true;
    await sdb.save();

    var count = sdb.quiz.quiz.count;
    var img = sdb.quiz.quiz.link[count];
    if (img == undefined || img == null || img == '') {
        vchannel.leave();
        return await end(client, message, sdb);
    }
    var url = ytdl(`https://youtu.be/PZCXXe3O-2Q`, { bitrate: 512000, quality: 'highestaudio' });
    var options = {
        volume: 0.21
    };
    const all_count = sdb.quiz.quiz.name.length;
    
    var list = `퀴즈를 종료하시려면 \` ${process.env.prefix}퀴즈 종료 \`를 입력해주세요.
힌트를 받으시려면 \`힌트 \`를 입력하거나 💡를 눌러주세요.
문제를 스킵하시려면 \` 스킵 \`을 입력하거나 ⏭️을 눌러주세요.`;
    var np = new MessageEmbed()
        .setTitle(`**정답 : ???**`)
        .setDescription(`**채팅창에 정답을 적어주세요.**\n**문제 : ${count+1}/${all_count}**`)
        .setImage(img)
        .setFooter(`기본 명령어 : ${process.env.prefix}퀴즈 도움말`)
        .setColor('ORANGE');

    try {
        var c = client.channels.cache.get(sdb.quiz.qzchannelid);
        c.messages.fetch(sdb.quiz.msg.listid).then(m => {
            m.edit(list);
        });
        c.messages.fetch(sdb.quiz.msg.npid).then(m => {
            m.edit(np);
        });
    } catch(err) {}

    try {
        vchannel.join().then(async function(connection) {
            db.set(`db.${message.guild.id}.img.time`, sdb.quiz.anser.imgtime);
            db.set(`db.${message.guild.id}.img.timer`, true);
            db.set(`db.${message.guild.id}.mq.timer`, true);
            await imgtimer(client, message, sdb, count, all_count, img);
            await timer(client, message, sdb);
            const dispatcher = connection.play(url, options);
            sdb.quiz.start.user = true;
            sdb.quiz.start.hint = true;
            await sdb.save();
            dispatcher.on('finish', async () => {
                return await anser(client, message, ['스킵','시간초과'], sdb, user);
            });
        });
    } catch(err) {
        return await end(client, message, sdb);
    }
}

async function getmusic(client = new Client, message = new Message, args = Array, sdb = MDB.object.server, vchannel = new Channel, user = new User, ulist = {
    url: String,
    desc: String,
    quiz: String,
    complite: Boolean,
}) {
    request(ulist.url.toString().toLocaleLowerCase().replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|\s]/g, encodeURIComponent), async (err, res, html) => {
        if (err) log.errlog(err);
        const $ = load(html);
        var dfname = [],
            dfvocal = [],
            dflink = [];
        $('body div.music div').each(async function () {
            dfname.push($(this).children('a.name').text().trim());
            dfvocal.push($(this).children('a.vocal').text().trim());
            dflink.push($(this).children('a.link').text().trim());
        });
        var rndlist = [],
            name = [],
            vocal = [],
            link = [],
            logtext = '';
        var count = dfname.length;
        var maxcount = 100;
        if (count > 50) count = 50;
        for (i=0; i<count; i++) {
            if (maxcount < 0) break;
            var r = Math.floor(Math.random()*(dfname.length+1));
            if (r >= 50 || rndlist.includes(r) || dfname[r] == '' || dfname[r] == undefined) {
                i--;
                maxcount--;
                continue;
            }
            maxcount = 100;
            rndlist.push(r);
            name.push(dfname[r]);
            vocal.push(dfvocal[r]);
            link.push(dflink[r]);
            logtext += `${i+1}. ${dfvocal[r]}-${dfname[r]} [${r+1}]\n`;
        }
        log.quizlog(message, logtext, new Date());
        var music = sdb.quiz;
        music.quiz.name = name;
        music.quiz.vocal = vocal;
        music.quiz.link = link;
        music.quiz.count = 0;
        music.start.start = true;
        music.start.user = false;
        sdb.quiz = music;
        await sdb.save();
        return await musicplay(client, message, args, sdb, vchannel, user);
    });
    return;
}
async function musicplay(client = new Client, message = new Message, args = Array, sdb = MDB.object.server, vchannel = new Channel, user = new User) {
    sdb.tts.tts = false;
    sdb.quiz.start.start = true;
    await sdb.save();

    var count = sdb.quiz.quiz.count;
    var link = sdb.quiz.quiz.link[count];
    if (link == undefined || link == null || link == '') {
        vchannel.leave();
        return await end(client, message, sdb);
    }
    const all_count = sdb.quiz.quiz.name.length;
    
    var list = `퀴즈를 종료하시려면 \` ${process.env.prefix}퀴즈 종료 \`를 입력해주세요.
힌트를 받으시려면 \`힌트 \`를 입력하거나 💡를 눌러주세요.
문제를 스킵하시려면 \` 스킵 \`을 입력하거나 ⏭️을 눌러주세요.`;
    var np = new MessageEmbed()
        .setTitle(`**정답 : ???**`)
        .setDescription(`**채팅창에 정답을 적어주세요.**\n**문제 : ${count+1}/${all_count}**`)
        .setImage(`https://ytms.netlify.app/question_mark.png`)
        .setFooter(`기본 명령어 : ${process.env.prefix}퀴즈 도움말`)
        .setColor('ORANGE');

    try {
        var c = client.channels.cache.get(sdb.quiz.qzchannelid);
        c.messages.fetch(sdb.quiz.msg.listid).then(m => {
            m.edit(list);
        });
        c.messages.fetch(sdb.quiz.msg.npid).then(m => {
            m.edit(np);
        });
    } catch(err) {}

    try {
        vchannel.join().then(async function(connection) {
            db.set(`db.${message.guild.id}.mq.timer`, true);
            await timer(client, message, sdb);
            const dispatcher = connection.play(ytdl(link, {
                bitrate: 512000,
                quality: 'highestaudio'
            }), {volume: 0.07});
            sdb.quiz.start.user = true;
            sdb.quiz.start.hint = true;
            await sdb.save();
            dispatcher.on('finish', async () => {
                return await anser(client, message, ['스킵','시간초과'], sdb, user);
            });
        });
    } catch(err) {
        return await end(client, message, sdb);
    }
}

function msgdelete(m = new Message, t = Number) {
    setTimeout(() => {
        try {
            m.delete();
        } catch(err) {}
    }, t);
}
