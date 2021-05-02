
require('dotenv').config();
const db = require('quick.db');
const request = require('request');
const { load } = require('cheerio');
const ytdl = require('ytdl-core');
const { MessageEmbed, Client, Message, Channel } = require('discord.js');
const MDB = require('../../MDB/data');

const mqscore = require('./score');
const msg = require('./msg');

const chack = /(?:http:\/\/|https:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?/gi;

const emerr = new MessageEmbed()
    .setTitle(`**음악퀴즈 오류**`)
    .setColor('RED');

module.exports = {
    end,
    start,
    anser,
    start_em,
    allmsgdelete,
    timer,
    play,
    ready,
};

async function end(client = new Client, message = new Message, sdb = MDB.object.server) {
    sdb.musicquiz.music.name = [];
    sdb.musicquiz.music.vocal = [];
    sdb.musicquiz.music.link = [];
    sdb.musicquiz.music.count = 0;

    sdb.musicquiz.user.hint = [];
    sdb.musicquiz.user.skip = [];

    sdb.musicquiz.start.start = false;
    sdb.musicquiz.start.embed = false;
    sdb.musicquiz.start.user = false;
    sdb.musicquiz.start.hint = false;

    sdb.musicquiz.page.click = 0;
    sdb.musicquiz.page.now = 0;
    sdb.musicquiz.page.slide = 0;
    sdb.musicquiz.page.p1 = 0;
    sdb.musicquiz.page.p2 = 0;
    sdb.musicquiz.page.p3 = 0;
    sdb.musicquiz.page.p4 = 0;

    sdb.tts.tts = true;

    await sdb.save().catch(err => console.log(err));
    var anser = sdb.musicquiz.anser.list[sdb.musicquiz.anser.anser];
    var time = sdb.musicquiz.anser.time;
    var list = await msg.list();
    var np = await msg.np(anser, time);
    try {
        message.guild.me.voice.channel.leave();
    } catch(err) {}
    try {
        client.channels.cache.get(sdb.musicquiz.vcid).leave();
    } catch(err) {}
    var c;
    try {
        c = client.channels.cache.get(sdb.musicquiz.mqchannelid);
    } catch(err) {}
    try {
        c.messages.fetch(sdb.musicquiz.msg.listid).then(m => {
            m.edit(list);
        });
        c.messages.fetch(sdb.musicquiz.msg.npid).then(m => {
            m.edit(np);
            m.reactions.removeAll();
        });
    } catch(err) {}

    await allmsgdelete(client, sdb, 2000);
}
async function start(client = new Client, message = new Message, args = Array, sdb = MDB.object.server, vchannel = new Channel) {
    console.log(1);
    await start_em(client, message, args, sdb, vchannel, {
        first: true,
    });
    await db.set(`db.${message.guild.id}.mq.timer`, true);
}
async function start_em(client = new Client, message = new Message, args = Array, sdb = MDB.object.server, vchannel = new Channel, opt = {
    first: Boolean,
}) {
    console.log(2);
    var data = sdb.musicquiz;
    const url = `${process.env.mqsite}/music_list.js`;
    request(url, async (err, res, body) => {
        if (!err) {
            var dflist = eval(body)[0];
            var text = [`\n`];

            if (opt.first) {
                data.page.now = 1;
                data.page.p1 = 0;
                try {
                    var c = client.channels.cache.get(data.mqchannelid);
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
            } else {
                data.page.slide = 0;
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
                                keys3[data.page.p3-1]
                            ];
                            if (data.page.now >=5) {
                                if (data.page.click == 1) {
                                    data.page.now = 1;
                                    data.page.click = 0;
                                    data.page.p1 = 0;
                                    data.page.p2 = 0;
                                    data.page.p3 = 0;
                                    data.page.p4 = 0;
                                    data.page.slide = 0;
                                    await db.set(`db.${message.guild.id}.mq.timer`, false);
                                    return await ready(client, message, args, sdb, vchannel, ulist);
                                }
                                data.page.now = 3;
                                data.page.p4 = 0;
                                data.page.slide = 0;
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
                return sdb.save().catch((err) => console.log(err));
            }
            sdb.save().catch((err) => console.log(err));
            if (data.page.now == 4) {
                data.page.slide = 0;
                var urllist = ulist.url.split('/');
                text[0] = `**이름** : ${urllist[urllist.length-1].replace('.html','')}\n**형식** : ${(ulist.quiz.music) ? `음악퀴즈` : (ulist.quiz.format || !ulist.quiz.format == '') ? ulist.quiz.format : `지정되지 않음`}\n**설명** : ${(ulist.desc || !ulist.desc == '') ? ulist.desc : `설명이 없습니다.`}\n\n1️⃣ 시작하기\n2️⃣ 뒤로가기\n`;
            } else {
                var uname = Object.keys(ulist);
                var i = 0, it = '', p = 0;
                while (i < uname.length) {
                    it = bignum((i+1)-(p*5));
                    text[p] += `${it}  ${uname[i]}\n`;
                    i++;
                }
                if (data.page.slide < 0) data.page.slide = 0;
                if (data.page.slide > text.length-1) data.page.slide = text.length-1;
            }
            const np = new MessageEmbed()
                .setTitle(`**음악퀴즈 선택화면**`)
                .setDescription(`
                    **\` 아래 숫자를 눌러 선택해주세요. \`**

                    ${text[data.page.slide]}
                        
                    (아래 이모지가 전부 로딩된 뒤 선택해주세요.)
                `)
                .setFooter(`기본 명령어 : ${process.env.prefix}음악퀴즈 도움말`)
                .setColor('ORANGE');
            try {
                var c = client.channels.cache.get(data.mqchannelid);
                c.messages.fetch(data.msg.npid).then(m => {
                    m.edit(np);
                });
            } catch(err) {
                console.log(err);
            }
        } else {
            console.log(err);
            return await end(client, message, sdb);
        }
    });
    return;
}
async function anser(client = new Client, message = new Message, args = Array, sdb = MDB.object.server) {
    db.set(`db.${message.guild.id}.mq.timer`, true);
    sdb.musicquiz.start.user = false;
    sdb.musicquiz.start.hint = false;
    sdb.musicquiz.user.hint = [];
    sdb.musicquiz.user.skip = [];
    await allmsgdelete(client, sdb, 1000);

    try {
        var anser_user;
        if (args[0] == '스킵' || args[0] == 'skip') {
            anser_user = (args[1] == '시간초과') ? '시간초과로 스킵되었습니다.' : (args[1] == '관리자') ? `${message.member.user.username} 님이 강제로 스킵했습니다.` : '스킵하셨습니다.';
            sdb.musicquiz.music.skipcount = sdb.musicquiz.music.skipcount+1;
        } else {
            anser_user = message.member.user.username;
            var userid = message.author.id;
            var score = sdb.musicquiz.user.score;
            if (score[userid]) {
                score[userid] = score[userid] + 1;
            } else {
                score[userid] = 1;
            }
            sdb.musicquiz.user.score = score;
        }
        var time = sdb.musicquiz.anser.time;
        var count = sdb.musicquiz.music.count;
        var all_count = sdb.musicquiz.music.name.length;
        var name = sdb.musicquiz.music.name[count];
        var vocal = sdb.musicquiz.music.vocal[count];
        var link = sdb.musicquiz.music.link[count];
        var yturl = link.replace(chack, '').replace(/(?:&(.+))/gi, '');
        var list = `음악퀴즈를 종료하시려면 \` ${process.env.prefix}음악퀴즈 종료 \`를 입력해주세요.`;
        var np = new MessageEmbed()
            .setTitle(`**정답 : ${name}**`)
            .setURL(link)
            .setDescription(`**가수 : ${vocal}**\n**정답자 : ${anser_user}**\n**곡 : ${count+1} / ${all_count}**`)
            .setImage(`http://img.youtube.com/vi/${yturl}/sddefault.jpg`)
            .setFooter(`${time}초 뒤에 다음곡으로 넘어갑니다.`)
            .setColor('ORANGE');
        
        try {
            var c = client.channels.cache.get(sdb.musicquiz.mqchannelid);
            c.messages.fetch(sdb.musicquiz.msg.listid).then(m => {
                m.edit(list);
            });
            c.messages.fetch(sdb.musicquiz.msg.npid).then(m => {
                m.edit(np);
            });
        } catch(err) {}
        sdb.musicquiz.music.count = sdb.musicquiz.music.count+1;
        await sdb.save().catch((err) => console.log(err));

        await mqscore.score(client, message, args, sdb);

        setTimeout(async function () {
            await allmsgdelete(client, sdb, 50);
            db.set(`db.${message.guild.id}.mq.timer`, false);
            var vchannel;
            try {
                vchannel = message.guild.me.voice.channel;
            } catch(err) {
                vchannel = client.channels.cache.get(sdb.musicquiz.vcid);
            }
            return await play(client, message, args, sdb, vchannel);
        }, time * 1000);
    } catch(err) {
        console.log(err);
    }
}

async function timer(client = new Client, message = new Message, sdb = MDB.object.server) {
    const ontimer = setInterval(async () => {
        var ts = db.get(`db.${message.guild.id}.mq.timer`) || false;
        if (!ts) {
            return clearInterval(ontimer);
        }
        if (!(!!message.guild.me.voice.channel)) {
            clearInterval(ontimer);
            return await end(client, message, sdb);
        }
    }, 1000);
}

function bignum(num=1) {
    return num == 1 ? '1️⃣' : num == 2 ? '2️⃣' : num == 3 ? '3️⃣' : num == 4 ? '4️⃣' : '5️⃣';
}

async function allmsgdelete(client = new Client, sdb = MDB.object.server, time = Number || 50) {
    try {
        c = client.channels.cache.get(sdb.musicquiz.mqchannelid);
        setTimeout(async () => {
            await c.messages.fetch().then(async (msg) => {
                if (msg.size > 3) {
                    await c.bulkDelete(msg.size-3);
                }
            });
        }, time);
    } catch(err) {}
}

async function play(client = new Client, message = new Message, args = Array, sdb = MDB.object.server, vchannel = new Channel) {
    sdb.tts.tts = false;
    sdb.musicquiz.start.start = true;
    await sdb.save().catch((err) => console.log(err));

    var count = sdb.musicquiz.music.count;
    var link = sdb.musicquiz.music.link[count];
    if (link == undefined || link == null || link == '') {
        vchannel.leave();
        await allmsgdelete(client, sdb, 50);
        return await end(client, message, sdb);
    }
    var url = ytdl(link, { bitrate: 512000, quality: 'highestaudio' });
    var options = {
        volume: 0.07
    };
    const manser = sdb.musicquiz.anser.list[sdb.musicquiz.anser.anser];
    const all_count = sdb.musicquiz.music.name.length;
    
    var list = `음악퀴즈를 종료하시려면 \` ${process.env.prefix}음악퀴즈 종료 \`를 입력해주세요.
힌트를 받으시려면 \`힌트 \`를 입력하거나 💡를 눌러주세요.
음악을 스킵하시려면 \` 스킵 \`을 입력하거나 ⏭️을 눌러주세요.`;
    var np = new MessageEmbed()
        .setTitle(`**정답 : ???**`)
        .setDescription(`**채팅창에 ${manser} 형식으로 적어주세요.**\n**곡 : ${count+1}/${all_count}**`)
        .setImage(`https://ytms.netlify.app/question_mark.png`)
        .setFooter(`기본 명령어 : ${process.env.prefix}음악퀴즈 도움말`)
        .setColor('ORANGE');

    try {
        var c = client.channels.cache.get(sdb.musicquiz.mqchannelid);
        c.messages.fetch(sdb.musicquiz.msg.listid).then(m => {
            m.edit(list);
        });
        c.messages.fetch(sdb.musicquiz.msg.npid).then(m => {
            m.edit(np);
        });
    } catch(err) {}

    vchannel.join().then(async (connection) => {
        db.set(`db.${message.guild.id}.mq.timer`, true);
        await timer(client, message, sdb);
        const dispatcher = connection.play(url, options);
        sdb.musicquiz.start.user = true;
        sdb.musicquiz.start.hint = true;
        await sdb.save().catch((err) => console.log(err));
        dispatcher.on('finish', async () => {
            return await anser(client, message, args, sdb);
        });
    })
}

async function ready(client = new Client, message = new Message, args = Array, sdb = MDB.object.server, vchannel = new Channel, ulist = {
    url: String,
    desc: String,
    quiz: {
        music: Boolean,
        format: String,
    },
    complite: Boolean,
}) {
    if (!ulist.complite) {
        await end(client, message, sdb);
        emerr.setDescription(`아직 이 퀴즈가 완성되지 않았습니다.`);
        return message.channel.send(emerr).then(m => msgdelete(m, Number(process.env.deletetime)));
    }
    sdb.musicquiz.start.user = false;
    sdb.musicquiz.user.hint = [];
    sdb.musicquiz.user.skip = [];
    sdb.musicquiz.user.score = [];
    sdb.musicquiz.music.skipcount = 0;
    sdb.save().catch((err) => console.log(err));
    var list = `**잠시뒤 음악퀴즈가 시작됩니다.**`;
    try {
        var c = client.channels.cache.get(sdb.musicquiz.mqchannelid);
        c.messages.fetch(sdb.musicquiz.msg.listid).then(m => {
            m.edit(list);
        });
    } catch(err) {}
    await mqscore.score(client, message, args, sdb);
    return await getmusic(client, message, args, sdb, vchannel, ulist);
}
async function getmusic(client = new Client, message = new Message, args = Array, sdb = MDB.object.server, vchannel = new Channel, ulist = {
    url: String,
    desc: String,
    quiz: {
        music: Boolean,
        format: String,
    },
    complite: Boolean,
}) {
    try {
        var c = client.channels.cache.get(sdb.musicquiz.mqchannelid);
        c.messages.fetch(sdb.musicquiz.msg.npid).then(m => {
            m.reactions.removeAll();
            m.react('💡');
            m.react('⏭️');
        });
    } catch(err) {}
    request(ulist.url.toString().toLocaleLowerCase(), async (err, res, html) => {
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
        if (count > 50) count = 50;
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
        console.log(logtext);
        var music = sdb.musicquiz;
        music.music.name = name;
        music.music.vocal = vocal;
        music.music.link = link;
        music.music.count = 0;
        music.start.start = true;
        music.start.user = false;
        sdb.musicquiz = music;
        await sdb.save().catch((err) => console.log(err));
        return await play(client, message, args, sdb, vchannel);
    });
    return;
}
