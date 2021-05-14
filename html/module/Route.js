
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, User } = require('discord.js');
const { client } = require('../../index');
const MDB = require('../../MDB/data');
const sdata = MDB.module.server();
const pdata = MDB.module.patchnote();
const express = require('express');
const router = express.Router();

const mdl = require('./mdl');
const pn = require('./pn');

const account = eval(process.env.ACCOUNT)[0];

/* 페이지 이동 */
router.get('/', async function(req, res) {
    req.session.login = false;
    return mdl.render(req, res, `index`, {user: {guildid: null}});
});
router.post('/', async function(req, res) {
    var guild = client.guilds.cache.get(req.body.serverid) || null;
    if (guild) {
        var user = (guild.members.cache.get(req.body.userid)) ? guild.members.cache.get(req.body.userid).user : null;
        var data = (user) ? {
            user: {
                guildid: guild.id || null,
                user: {
                    id: user.id || null,
                    tag: user.tag || null,
                    name: user.username || null,
                    avatarURL: user.avatarURL({format: 'png', size: 4096 }) || null
                }
            }
        } : {
            user: {
                guildid: guild.id || null,
                user: {id: null}
            }
        };
        return mdl.render(req, res, `index`, data);
    } else {
        return mdl.render(req, res, `index`, {user:{guildid: null}});
    }
});

router.get('/name', async function(req, res) {
    return mdl.render(req, res, `name`, {
        q: (req.query.q) ? req.query.q : '',
        sdb: {id: null}
    });
});
router.post('/name', async function(req, res) {
    var sdb = MDB.object.server;
    sdata.find(async function(err, udblist) {
        for (db1 of udblist) {
            sdb = db1;
            var data = {};
            if (req.body.servername) {
                var guild = client.guilds.cache.get(sdb.serverid) || null;
                if (guild) {
                    if (guild.name.includes(req.body.servername)) {
                        var data = {
                            id: sdb.serverid || null,
                            name: sdb.name || null,
                            quiz: sdb.quiz || null,
                            tts: sdb.tts || null,
                            selfcheck: sdb.selfcheck || null,
                            role: sdb.role || null,
                        };
                        return res.render(`name`, {
                            q: (req.query.q) ? req.query.q : '',
                            sdb: data
                        });
                    }
                    break;
                }
            }
        }
        return res.render(`name`, {
            q: (req.query.q) ? req.query.q : '',
            sdb: {id: null},
        });
    });
});

router.get('/server/:serverId', async function(req, res) {
    var guild = client.guilds.cache.get(req.params.serverId) || null;
    if (guild) {
        return res.send({
            id: guild.id || null,
            name: guild.name || null,
            icon: guild.iconURL({format: 'png', size: 4096 }) || null,
            owner: (guild.owner) ? {
                id: guild.ownerID || null,
                tag: guild.owner.user.tag || null,
                name: guild.owner.user.username || null,
                nickname: guild.owner.displayName || null,
                avatarURL: guild.owner.user.avatarURL({format: 'png', size: 4096 }) || null,
            } : {id: null},
            channel: guild.channels || null,
        });
    } else {
        return res.send({id: null});
    }
});

router.get('/user/:userId', async function(req, res) {
    var user = client.users.cache.get(req.params.userId) || null;
    if (user) {
        return res.send({
            id: user.id || null,
            tag: user.tag || null,
            name: user.username || null,
            avatarURL: user.avatarURL({format: 'png', size: 4096 }) || null,
        });
    } else {
        return res.send({id: null});
    }
});

const notelist = {
    bot: `디스코드 봇`,
    site: `사이트`,
    musicquiz: `음악퀴즈`
};
router.get('/patchnote/:note/remove/:date', async function(req, res) {
    if (!req.session.login) return mdl.render(req, res, `login`, {
        title: '로그인',
        url: `/patchnote/${req.params.note}/remove/${req.params.date}`
    });
    var note = req.params.note;
    var date = req.params.date.split('-');

    if (notelist[note]) {
        pdata.deleteOne({
            type: note,
            year: date[0],
            month: date[1],
            day: date[2]
        }, {limit: 1}, async function(err, res2) {
            if (err) return mdl.render(req, res, `err`, {text: `노트 삭제중 오류가 발생했습니다.`});
            return res.send(`
                <script 'type=text/javascript'>
                    alert('노트가 삭제되었습니다.');
                    window.location='/patchnote/${note}';
                </script>
            `);
        });
        return;
    }
});
router.get('/patchnote/:note/write(/:date)?', async function(req, res) {
    if (!req.session.login) return mdl.render(req, res, `login`, {
        title: '로그인',
        url: `/patchnote/${req.params.note}/write${(req.params.date) ? `/${req.params.date}` : ''}`,
        back: `/patchnote/${req.params.note}`
    });
    var note = req.params.note;
    var date = req.params.date || null;
    if (notelist[note]) {
        if (date) {
            var pdb = MDB.object.patchnote;
            pdata.find(async function(err, pdblist) {
                for (db1 of pdblist) {
                    pdb = db1;
                    if (pdb.type === note && `${pdb.year}-${pdb.month}-${pdb.day}` === date) {
                        return mdl.render(req, res, `patchnote_write`, {
                            title: `글쓰기`,
                            note: note,
                            notetext: notelist[note],
                            date: date,
                            text: pdb.text
                        });
                    }
                }
                return mdl.render(req, res, `err`, {
                    text: `페이지를 찾을수 없습니다.`
                });
            });
            return;
        }
        return mdl.render(req, res, `patchnote_write`, {
            title: `글쓰기`,
            note: note,
            notetext: notelist[note],
            date: null,
            text: null
        });
    }
});
router.post('/patchnote/:note/write(/:date)?', async function(req, res) {
    var note = req.params.note;
    var date = (req.params.date) ? true : false;
    if (notelist[note]) {
        return pn.patchnote_check(req, res, note, notelist, req.body.date, req.body.text, date);
    }
    return mdl.render(req, res, `err`, {text: `패치노트를 찾을수 없습니다.`});
});
router.get(`/patchnote(/:note)?(/:date)?`, async function(req, res) {
    var login = req.session.login || false;
    var note = req.params.note || null;
    var date = req.params.date || null;
    if (note) {
        if (date) {
            return pn.patchnote_get(req, res, note, notelist[note], date, login);
        }
        if (notelist[note]) return pn.patchnote(req, res, note, notelist[note], login);
        return mdl.render(req, res, `err`, {text: `패치노트를 찾을수 없습니다.`});
    }
    return mdl.render(req, res, `patchnote`, {
        title: `패치노트`,
        note: note,
        notetext: notelist[note],
        text: null,
        file: null,
        login: login
    });
});

router.get('/login', async function(req, res) {
    req.session.login = false;
    return mdl.render(req, res, `login`, {
        title: '로그인',
        url: '/',
        back: '/'
    });
});
router.post('/login', async function(req, res) {
    var id = req.body.id;
    var pw = req.body.pw;
    var url = req.body.url;
    var back = req.body.back;
    if (id === account.patchnote.id) {
        if (pw === account.patchnote.pw) {
            req.session.login = true;
            return res.send(`
                <script 'type=text/javascript'>
                    alert('관리자로그인 성공');
                    window.location='${url}';
                </script>
            `);
        }
        return res.send(`
            <script 'type=text/javascript'>
                alert('로그인 에러 : 올바르지 않은 비밀번호');
                window.location='${back}';
            </script>
        `);
    }
    return res.send(`
        <script 'type=text/javascript'>
            alert('로그인 에러 : 올바르지 않은 아이디');
            window.location='${back}';
        </script>
    `);
});
router.get('/logout', async function(req, res) {
    req.session.login = false;
    return res.send(`
        <script 'type=text/javascript'>
            alert('로그아웃 되셨습니다.');
            window.location='/';
        </script>
    `);
});

module.exports = router;
