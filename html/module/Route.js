
require('dotenv').config();
const db = require('quick.db');
const { MessageEmbed, Client, Message, User } = require('discord.js');
const { client } = require('../../index');
const MDB = require('../../MDB/data');
const sdata = MDB.module.server();
const express = require('express');

const router = express.Router();

/* 페이지 이동 */
async function render(req, res, ejs = '', data = {}) {
    return res.status(200).render(ejs, {domain: process.env.DOMAIN, data: data});
}
router.get('/', async function(req, res) {
    return render(req, res, `index`, {user: {guildid: null}});
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
        return render(req, res, `index`, data);
    } else {
        return render(req, res, `index`, {user:{guildid: null}});
    }
});

router.get('/name', async function(req, res) {
    return render(req, res, `name`, {
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

module.exports = router;
